"""Owner-scoped metadata and filesystem object storage."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import hashlib
from pathlib import Path
import secrets
import sqlite3


@dataclass(frozen=True)
class FileMetadata:
    object_id: str
    owner_id: str
    display_name: str
    size: int
    content_type: str
    created_at: str
    sha256: str


class LocalStorage:
    def __init__(self, root: str | Path, database: str | Path = ":memory:", max_bytes: int = 10_000_000):
        if max_bytes <= 0:
            raise ValueError("max_bytes must be positive")
        self.root = Path(root).resolve()
        self.root.mkdir(parents=True, exist_ok=True)
        self.connection = sqlite3.connect(str(database))
        self.connection.row_factory = sqlite3.Row
        self.connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS files (
                object_id TEXT PRIMARY KEY,
                owner_id TEXT NOT NULL,
                display_name TEXT NOT NULL,
                size INTEGER NOT NULL,
                content_type TEXT NOT NULL,
                created_at TEXT NOT NULL,
                sha256 TEXT NOT NULL
            )
            ;
            CREATE TABLE IF NOT EXISTS audit_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id TEXT NOT NULL,
                action TEXT NOT NULL,
                object_id TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        self.connection.commit()
        self.max_bytes = max_bytes

    def close(self) -> None:
        self.connection.close()

    def put(self, owner_id: str, display_name: str, content: bytes, content_type: str) -> FileMetadata:
        if not owner_id.strip():
            raise ValueError("owner_id cannot be empty")
        if not display_name.strip():
            raise ValueError("display_name cannot be empty")
        if len(content) > self.max_bytes:
            raise ValueError("file exceeds the configured size limit")
        object_id = secrets.token_urlsafe(24)
        path = self._path_for(object_id)
        path.write_bytes(content)
        now = datetime.now(timezone.utc).isoformat()
        self.connection.execute(
            "INSERT INTO files VALUES (?, ?, ?, ?, ?, ?, ?)",
            (object_id, owner_id, Path(display_name).name, len(content), content_type, now,
             hashlib.sha256(content).hexdigest()),
        )
        self._audit(owner_id, "uploaded", object_id)
        self.connection.commit()
        return self.metadata(owner_id, object_id)

    def metadata(self, owner_id: str, object_id: str) -> FileMetadata:
        row = self.connection.execute(
            "SELECT * FROM files WHERE owner_id = ? AND object_id = ?",
            (owner_id, object_id),
        ).fetchone()
        if row is None:
            raise FileNotFoundError("file not found")
        return FileMetadata(
            object_id=row["object_id"], owner_id=row["owner_id"], display_name=row["display_name"],
            size=row["size"], content_type=row["content_type"], created_at=row["created_at"],
            sha256=row["sha256"],
        )

    def list(self, owner_id: str) -> list[FileMetadata]:
        rows = self.connection.execute(
            "SELECT * FROM files WHERE owner_id = ? ORDER BY created_at DESC", (owner_id,)
        ).fetchall()
        return [self.metadata(owner_id, row["object_id"]) for row in rows]

    def used_bytes(self, owner_id: str) -> int:
        row = self.connection.execute(
            "SELECT COALESCE(SUM(size), 0) AS total FROM files WHERE owner_id = ?",
            (owner_id,),
        ).fetchone()
        return int(row["total"])

    def verify_integrity(self, owner_id: str, object_id: str) -> bool:
        metadata = self.metadata(owner_id, object_id)
        digest = hashlib.sha256(self._path_for(object_id).read_bytes()).hexdigest()
        return digest == metadata.sha256

    def read(self, owner_id: str, object_id: str) -> bytes:
        self.metadata(owner_id, object_id)
        return self._path_for(object_id).read_bytes()

    def delete(self, owner_id: str, object_id: str) -> None:
        self.metadata(owner_id, object_id)
        self._path_for(object_id).unlink(missing_ok=False)
        self.connection.execute(
            "DELETE FROM files WHERE owner_id = ? AND object_id = ?",
            (owner_id, object_id),
        )
        self._audit(owner_id, "deleted", object_id)
        self.connection.commit()

    def audit_events(self, owner_id: str) -> list[dict[str, str | None]]:
        rows = self.connection.execute(
            "SELECT action, object_id, created_at FROM audit_events WHERE owner_id = ? ORDER BY id",
            (owner_id,),
        ).fetchall()
        return [dict(row) for row in rows]

    def _audit(self, owner_id: str, action: str, object_id: str | None) -> None:
        self.connection.execute(
            "INSERT INTO audit_events(owner_id, action, object_id, created_at) VALUES (?, ?, ?, ?)",
            (owner_id, action, object_id, datetime.now(timezone.utc).isoformat()),
        )

    def _path_for(self, object_id: str) -> Path:
        if not object_id or Path(object_id).name != object_id or object_id in {".", ".."}:
            raise ValueError("invalid object id")
        path = (self.root / object_id).resolve()
        if path.parent != self.root:
            raise ValueError("invalid object path")
        return path
