import React, { useState } from 'react';
import { BookOpen, Search, HelpCircle, Lightbulb, Compass } from 'lucide-react';

interface GlossaryItem {
  term: string;
  simpleDefinition: string;
  realWorldMetaphor: string;
  whyItMatters: string;
  example: string;
}

export const GlossaryPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const terms: GlossaryItem[] = [
    {
      term: 'IP Address',
      simpleDefinition: 'A unique digital label assigned to every device connected to a computer network.',
      realWorldMetaphor: 'Think of an IP address like a house mailing address. Without a street address, the mail carrier cannot deliver letters to your home.',
      whyItMatters: 'In NetEvidence AI, the IP address is the starting target we examine to discover what kind of organization operates it.',
      example: '73.168.45.112 or 8.8.8.8'
    },
    {
      term: 'IPv4 vs. IPv6',
      simpleDefinition: 'IPv4 is the original numbering standard using 4 numbers separated by dots (e.g. 192.0.2.1). IPv6 is the modern upgraded format with 8 groups of hexadecimal digits separated by colons.',
      realWorldMetaphor: 'IPv4 is like 7-digit telephone numbers from the 1980s. When the world ran out of phone numbers, area codes and international codes (IPv6) were added so billions more phones could connect.',
      whyItMatters: 'NetEvidence AI natively parses both formats and detects whether they belong to public global routing or private subnets.',
      example: 'IPv4: 198.51.100.25 | IPv6: 2001:0db8:85a3::8a2e:0370:7334'
    },
    {
      term: 'ASN (Autonomous System Number)',
      simpleDefinition: 'A globally registered identification number for a large network or company that controls its own internet routing.',
      realWorldMetaphor: 'If an IP address is a house, an ASN is like an entire postal district or national airline network (such as Comcast, Amazon, or Indian Railways).',
      whyItMatters: 'Knowing the ASN tells us which company owns the network block (for example, AS16509 belongs to Amazon AWS, while AS7922 belongs to Comcast Cable).',
      example: 'AS16509 (Amazon.com) or AS3 (MIT)'
    },
    {
      term: 'BGP (Border Gateway Protocol)',
      simpleDefinition: 'The navigational postal system of the Internet. BGP routers exchange directions on how to reach different IP blocks across countries.',
      realWorldMetaphor: 'Imagine a giant GPS highway navigation map where every state and country constantly announces which roads and bridges are open.',
      whyItMatters: 'If an IP address is not announced in BGP, traffic cannot reach it on the public internet.',
      example: '73.168.32.0/20 announced by AS7922'
    },
    {
      term: 'Reverse DNS (PTR Lookup)',
      simpleDefinition: 'A way to ask the internet: "What domain name belongs to this IP number?"',
      realWorldMetaphor: 'Looking up a telephone number in a reverse phone directory to see whose name and business is listed next to it.',
      whyItMatters: 'Domain names often have words like "res" (residential broadband) or "compute" (cloud server virtual machine) that reveal how the network is used.',
      example: 'c-73-168-45-112.hsd1.co.comcast.net'
    },
    {
      term: 'Network Prefix / CIDR',
      simpleDefinition: 'A shorthand notation representing a cluster or block of consecutive IP addresses managed together.',
      realWorldMetaphor: 'Like an entire zip code or neighborhood block rather than a single house door.',
      whyItMatters: 'Large blocks (like /16) are common for massive cloud datacenters or national mobile carriers, whereas smaller subnets (/24) may represent specific office buildings.',
      example: '54.214.0.0/16 (contains 65,536 addresses)'
    },
    {
      term: 'Confidence Score (0-100)',
      simpleDefinition: 'A calculated numeric score showing how strongly multiple independent signals agree on the final network classification.',
      realWorldMetaphor: 'Like a jury in court: if 4 independent witnesses tell the exact same story with no contradictions, confidence is very high. If 2 witnesses disagree, confidence drops.',
      whyItMatters: 'We never pretend an arbitrary number is magical certainty. Every point is calculated from agreeing sensors and penalized for conflicts.',
      example: 'Confidence: 85/100 (High Agreement)'
    },
    {
      term: 'Evidence Quality (Strong, Moderate, Limited)',
      simpleDefinition: 'An assessment of the freshness, completeness, and reliability of the data sources available for an IP address.',
      realWorldMetaphor: 'Having an original passport vs a blurry photocopied library card. Both are documents, but the passport is far higher evidence quality.',
      whyItMatters: 'Separate from confidence: even if we are sure an address is private (100% confidence), its public registry quality is "Limited" because it is not in public BGP tables.',
      example: 'Strong (>= 3 independent verified sources with live records)'
    },
    {
      term: 'Residential vs. Hosting vs. Mobile',
      simpleDefinition: 'The three primary classes of internet connections: homes (residential broadband), servers/cloud (hosting/datacenter), and cellular phones (mobile 4G/5G).',
      realWorldMetaphor: 'Residential is like a family house; Hosting is like a massive warehouse facility with backup power; Mobile is like a delivery van moving between cell towers.',
      whyItMatters: 'Cybersecurity defenders need to know whether traffic originates from regular people at home, automated cloud bots, or smartphone carriers.',
      example: 'Residential: Home Wi-Fi | Hosting: AWS EC2 | Mobile: Verizon 5G'
    }
  ];

  const filtered = terms.filter(
    (t) =>
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.simpleDefinition.toLowerCase().includes(search.toLowerCase()) ||
      t.realWorldMetaphor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Help & Plain-English Glossary
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Written for everyday students and analysts: every technical concept explained simply without confusing jargon.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search technical terms (e.g. ASN, BGP, Reverse DNS, Prefix)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs sm:text-sm shadow-sm"
        />
      </div>

      {/* Terms Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.term}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                {item.term}
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                Concept
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Simple Definition
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {item.simpleDefinition}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 text-xs">
              <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1 mb-0.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Real-World Metaphor:
              </span>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                {item.realWorldMetaphor}
              </p>
            </div>

            <div className="text-xs pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                <strong className="text-slate-800 dark:text-slate-200">Why NetEvidence uses it: </strong>
                {item.whyItMatters}
              </p>
              <p className="text-slate-500 font-mono text-[11px]">
                Example: <span className="text-blue-600 dark:text-blue-400">{item.example}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
