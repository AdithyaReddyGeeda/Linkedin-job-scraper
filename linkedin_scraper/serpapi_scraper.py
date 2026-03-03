"""SerpAPI Google Jobs integration. Optional: requires SERPAPI_API_KEY and pip install google-search-results."""

import os
from typing import Optional

from .scraper import Job


def _get_client():
    try:
        from serpapi import GoogleSearch
        return GoogleSearch
    except ImportError:
        return None


class SerpApiScraper:
    """
    Fetches job listings via SerpAPI Google Jobs API.
    Requires: SERPAPI_API_KEY env var, pip install google-search-results
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = (api_key or os.environ.get("SERPAPI_API_KEY") or "").strip()
        self._client = _get_client()

    @classmethod
    def is_available(cls, api_key: Optional[str] = None) -> bool:
        key = (api_key or os.environ.get("SERPAPI_API_KEY") or "").strip()
        return bool(key and _get_client())

    def search(
        self,
        keyword: str,
        location: str = "",
        limit: int = 25,
        **kwargs,
    ) -> list[Job]:
        """
        Search Google Jobs via SerpAPI.
        Returns list of Job objects; respects limit via pagination (10 per page).
        """
        if not self.api_key or not self._client:
            return []
        GoogleSearch = self._client
        all_jobs = []
        next_token = None
        page_limit = min(limit, 50)

        while len(all_jobs) < page_limit:
            params = {
                "api_key": self.api_key,
                "engine": "google_jobs",
                "q": keyword,
                "gl": "us",
                "hl": "en",
            }
            if location:
                params["location"] = location
            if next_token:
                params["next_page_token"] = next_token

            try:
                search = GoogleSearch(params)
                data = search.get_dict()
            except Exception:
                break

            if not data or data.get("search_metadata", {}).get("status") != "Success":
                break

            results = data.get("jobs_results") or []
            for r in results:
                job = self._result_to_job(r)
                if job:
                    all_jobs.append(job)
                if len(all_jobs) >= page_limit:
                    break

            next_token = (data.get("serpapi_pagination") or {}).get("next_page_token")
            if not next_token or not results:
                break

        return all_jobs[:limit]

    def _result_to_job(self, r: dict) -> Optional[Job]:
        title = (r.get("title") or "").strip()
        company = (r.get("company_name") or "").strip()
        if not title or not company:
            return None
        location_str = (r.get("location") or "").strip()
        description = (r.get("description") or "").strip()
        extensions = r.get("extensions") or []
        detected = r.get("detected_extensions") or {}
        ago = detected.get("posted_at") or (extensions[0] if extensions else "")
        job_type = detected.get("schedule_type") or (extensions[1] if len(extensions) > 1 else "")
        apply_opts = r.get("apply_options") or []
        job_url = (apply_opts[0].get("link") if apply_opts else None) or r.get("share_link") or ""

        return Job(
            position=title,
            company=company,
            company_logo=r.get("thumbnail"),
            location=location_str,
            date="",
            ago_time=ago or "",
            salary="",
            job_url=job_url,
            description=description or None,
            skills=None,
            apply_method=None,
            applicant_count=None,
        )

    def fetch_job_details(self, job: Job) -> Job:
        """SerpAPI does not support fetching single job details; return as-is."""
        return job
