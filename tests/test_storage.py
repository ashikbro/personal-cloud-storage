import pytest

from personal_cloud import LocalStorage


def test_storage_is_owner_scoped_and_uses_opaque_objects(tmp_path):
    storage = LocalStorage(tmp_path / "objects", max_bytes=20)
    metadata = storage.put("user-1", "../private.txt", b"secret", "text/plain")
    assert metadata.display_name == "private.txt"
    assert storage.read("user-1", metadata.object_id) == b"secret"
    with pytest.raises(FileNotFoundError):
        storage.read("user-2", metadata.object_id)
    storage.delete("user-1", metadata.object_id)
    assert not (tmp_path / "objects" / metadata.object_id).exists()


def test_storage_enforces_size_limit(tmp_path):
    storage = LocalStorage(tmp_path / "objects", max_bytes=3)
    with pytest.raises(ValueError, match="size limit"):
        storage.put("user", "file.txt", b"four", "text/plain")
