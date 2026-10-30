"""
Base Evidence Adapter Interface
All evidence sources must implement this abstract class.
"""
from abc import ABC, abstractmethod
from typing import List
from app.schemas.analysis import EvidenceItem

class BaseEvidenceAdapter(ABC):
    @property
    @abstractmethod
    def source_name(self) -> str:
        """Name of the intelligence provider or sensor."""
        pass

    @property
    @abstractmethod
    def source_category(self) -> str:
        """Category: 'asn', 'bgp', 'rdns', 'whois', 'intelligence'"""
        pass

    @abstractmethod
    async def collect(self, ip: str) -> List[EvidenceItem]:
        """
        Asynchronously fetches and normalizes evidence items for the given IP.
        Must handle errors gracefully and return EvidenceItem with status='error'
        rather than raising unhandled exceptions.
        """
        pass
