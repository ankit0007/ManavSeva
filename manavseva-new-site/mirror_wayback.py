import html
import posixpath
import re
import subprocess
import time
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse


SNAPSHOT = "20180804170316"
DOMAIN = "vedvidyalayaindore.com"
ROOT_URL = f"http://{DOMAIN}/"
ARCHIVE_PREFIX = f"https://web.archive.org/web/{SNAPSHOT}id_/"
OUTPUT = Path(__file__).parent
USER_AGENT = "Mozilla/5.0 (compatible; local archive mirror)"

HTML_ATTR_RE = re.compile(
    r"""(?P<prefix>\b(?:href|src|action|poster)\s*=\s*)(?P<quote>["'])(?P<url>.*?)(?P=quote)""",
    re.IGNORECASE,
)
CSS_URL_RE = re.compile(r"""url\(\s*(?P<quote>["']?)(?P<url>.*?)(?P=quote)\s*\)""", re.IGNORECASE)


def site_url(value: str, base: str) -> str | None:
    value = html.unescape(value.strip())
    if not value or value.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return None
    if value.startswith("https://web.archive.org/"):
        match = re.search(r"/web/\d+(?:id_)?/(https?://.*)$", value)
        if match:
            value = match.group(1)
    absolute = urljoin(base, value)
    parsed = urlparse(absolute)
    if parsed.scheme not in ("http", "https") or parsed.netloc.lower() not in {
        DOMAIN,
        f"www.{DOMAIN}",
    }:
        return None
    path = unquote(parsed.path or "/")
    if path == "/":
        path = "/index.html"
    elif path.endswith("/"):
        path += "index.html"
    return f"http://{DOMAIN}{path}" + (f"?{parsed.query}" if parsed.query else "")


def local_path(url: str) -> Path:
    parsed = urlparse(url)
    path = parsed.path.lstrip("/") or "index.html"
    if path.endswith("/"):
        path += "index.html"
    # Query-string resources are uncommon here; retain them safely if needed.
    if parsed.query:
        path += "__" + re.sub(r"[^A-Za-z0-9._-]+", "_", parsed.query)
    return OUTPUT / path


def archive_url(url: str) -> str:
    parsed = urlparse(url)
    return ARCHIVE_PREFIX + f"http://{DOMAIN}{parsed.path or '/'}" + (
        f"?{parsed.query}" if parsed.query else ""
    )


def fetch(url: str) -> tuple[bytes, str] | None:
    for attempt in range(3):
        try:
            result = subprocess.run(
                [
                    "curl.exe",
                    "-L",
                    "--fail",
                    "--silent",
                    "--show-error",
                    "--max-time",
                    "30",
                    "-A",
                    USER_AGENT,
                    archive_url(url),
                ],
                capture_output=True,
                timeout=40,
                check=True,
            )
            suffix = Path(urlparse(url).path).suffix.lower()
            content_type = "text/html" if suffix in {".html", ".htm", ""} else (
                "text/css" if suffix == ".css" else "application/octet-stream"
            )
            return result.stdout, content_type
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
            if attempt == 2:
                print(f"FAILED {url}: {exc}")
            else:
                time.sleep(1.5 * (attempt + 1))
    return None


def extract_urls(content: str, base: str) -> set[str]:
    found = set()
    for match in HTML_ATTR_RE.finditer(content):
        target = site_url(match.group("url"), base)
        if target:
            found.add(target)
    for match in CSS_URL_RE.finditer(content):
        target = site_url(match.group("url"), base)
        if target:
            found.add(target)
    return found


def rewrite_html(content: str, base: str) -> str:
    def replace(match: re.Match) -> str:
        target = site_url(match.group("url"), base)
        if not target:
            return match.group(0)
        return match.group("prefix") + match.group("quote") + local_href(target, base) + match.group("quote")

    return HTML_ATTR_RE.sub(replace, content)


def rewrite_css(content: str, base: str) -> str:
    def replace(match: re.Match) -> str:
        target = site_url(match.group("url"), base)
        if not target:
            return match.group(0)
        quote = match.group("quote")
        return f"url({quote}{local_href(target, base)}{quote})"

    return CSS_URL_RE.sub(replace, content)


def local_href(target: str, base: str) -> str:
    destination = local_path(target)
    source = local_path(base)
    return posixpath.relpath(destination.relative_to(OUTPUT).as_posix(), source.parent.relative_to(OUTPUT).as_posix() or ".")


def main() -> None:
    queue = [ROOT_URL]
    queued = set(queue)
    downloaded: dict[str, str] = {}
    while queue:
        url = queue.pop(0)
        result = fetch(url)
        if result is None:
            continue
        data, content_type = result
        path = local_path(url)
        path.parent.mkdir(parents=True, exist_ok=True)
        if content_type in ("text/html", "application/xhtml+xml") or path.suffix.lower() in {
            ".html",
            ".htm",
        }:
            text = data.decode("utf-8", errors="replace")
            downloaded[url] = content_type
            for target in sorted(extract_urls(text, url)):
                if target not in queued:
                    queued.add(target)
                    queue.append(target)
            path.write_text(rewrite_html(text, url), encoding="utf-8")
        elif content_type == "text/css" or path.suffix.lower() == ".css":
            text = data.decode("utf-8", errors="replace")
            for target in sorted(extract_urls(text, url)):
                if target not in queued:
                    queued.add(target)
                    queue.append(target)
            path.write_text(rewrite_css(text, url), encoding="utf-8")
        else:
            path.write_bytes(data)
        print(f"OK {url} -> {path.relative_to(OUTPUT)}", flush=True)

    # Rewrite again after crawling so every discovered internal reference is local.
    for url, content_type in downloaded.items():
        path = local_path(url)
        text = path.read_text(encoding="utf-8", errors="replace")
        path.write_text(
            rewrite_css(text, url) if content_type == "text/css" else rewrite_html(text, url),
            encoding="utf-8",
        )
    print(f"Mirrored {len(list(OUTPUT.rglob('*')))} filesystem entries.")


if __name__ == "__main__":
    main()
