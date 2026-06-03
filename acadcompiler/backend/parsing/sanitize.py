"""Guards against zip bombs, XXE, and malformed archives in .docx uploads."""
import zipfile
import io
from lxml import etree

MAX_DECOMPRESSED_MB = 100
MAX_FILE_COUNT = 1000
ALLOWED_MIME_TYPES = {"application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/pdf"}


def safe_open_docx(data: bytes) -> zipfile.ZipFile:
    """Open a docx (which is a zip) with decompression-bomb protection."""
    zf = zipfile.ZipFile(io.BytesIO(data))
    total = sum(i.file_size for i in zf.infolist())
    if total > MAX_DECOMPRESSED_MB * 1024 * 1024:
        raise ValueError(f"Decompressed size {total} exceeds limit {MAX_DECOMPRESSED_MB}MB")
    if len(zf.infolist()) > MAX_FILE_COUNT:
        raise ValueError(f"Too many files in archive: {len(zf.infolist())}")
    return zf


def safe_parse_xml(xml_bytes: bytes) -> etree._Element:
    """Parse XML with XXE disabled."""
    parser = etree.XMLParser(resolve_entities=False, no_network=True, dtd_validation=False)
    return etree.fromstring(xml_bytes, parser=parser)
