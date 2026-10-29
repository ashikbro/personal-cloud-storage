# Personal Cloud Storage

A self-hosted file-storage service for uploading, organizing, previewing, and
downloading personal files.

## Status

**Foundation stage — safe local object storage is implemented.**

The repository includes an owner-scoped filesystem storage boundary with
opaque object IDs, sanitized display names, metadata, SHA-256 integrity
metadata, and upload-size limits. Authentication, encryption, previews, and
web/API layers remain separate roadmap items.

## First-release scope

- User authentication and session management
- File upload, download, rename, move, and delete
- Folder navigation and searchable metadata
- Safe previews for common image, text, and PDF formats
- Per-user quotas and upload-size limits
- Audit events for authentication and file operations
- Backup and restore documentation

## Recommended architecture

```text
web/       Browser client
api/       Authentication, metadata, and file-operation APIs
worker/    Preview generation and antivirus scanning
db/        Users, files, folders, quotas, and audit events
storage/   Local filesystem or S3-compatible object storage
```

Keep file metadata in the database and file bytes in a storage abstraction.
Generate object keys independently of user-provided filenames and store the
original name only as display metadata.

## Security requirements

- Hash passwords with a modern password-hashing function; never store plaintext.
- Use secure, HttpOnly, SameSite cookies or short-lived access tokens.
- Authorize every file operation against the owning user.
- Resolve paths through object IDs; never concatenate user input into filesystem paths.
- Enforce upload size, type, and quota limits on the server.
- Treat file extensions and MIME types as untrusted; scan before previewing.
- Store encryption keys outside the repository and document key rotation.
- Avoid serving uploads from an executable web root.
- Add rate limits, CSRF protection, security headers, and structured audit logs.

## Roadmap

1. Scaffold health checks, authentication, and database migrations.
2. Implement file metadata and object-storage operations with authorization tests.
3. Add quotas, safe uploads, antivirus scanning, and preview workers.
4. Add encrypted storage, backup/restore, and operational documentation.
5. Add deployment automation and a security review before public exposure.

## Development

```sh
python -m venv .venv
.venv/bin/pip install pytest
PYTHONPATH=src .venv/bin/pytest
```
