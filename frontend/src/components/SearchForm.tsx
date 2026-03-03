import React, { useState, useRef, useEffect } from 'react';
import type { SearchFilters, JobSource } from '../types/job';

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
  initialFilters?: Partial<SearchFilters>;
}

const defaultFilters: SearchFilters = {
  keyword: '',
  location: 'United States',
  jobType: '',
  remote: '',
  experience: '',
  datePosted: '',
  salary: '',
  sortBy: 'relevant',
  easyApply: false,
  under10Applicants: false,
  companySize: '',
  limit: 12,
  details: false,
  sources: ['linkedin'],
};

const SOURCE_INFO: Record<JobSource, { name: string; color: string; icon: string }> = {
  linkedin: { name: 'LinkedIn', color: 'bg-blue-500', icon: '💼' },
  indeed: { name: 'Indeed', color: 'bg-purple-500', icon: '🔍' },
  greenhouse: { name: 'Greenhouse', color: 'bg-green-500', icon: '🌱' },
  serpapi: { name: 'SerpAPI (Google Jobs)', color: 'bg-amber-500', icon: '🔎' },
};

const LOCATION_OPTIONS: { value: string; label: string }[] = [
  { value: 'United States', label: 'United States' },
  { value: 'Remote', label: 'Remote' },
  { value: 'Iowa', label: 'Iowa' },
  { value: 'Texas', label: 'Texas' },
  { value: 'Illinois', label: 'Illinois' },
  { value: 'Chicago', label: 'Chicago, IL' },
  { value: 'Minnesota', label: 'Minnesota' },
  { value: 'Wisconsin', label: 'Wisconsin' },
  { value: 'Nebraska', label: 'Nebraska' },
  { value: 'Ohio', label: 'Ohio' },
  { value: 'Michigan', label: 'Michigan' },
  { value: 'Indiana', label: 'Indiana' },
  { value: 'Colorado', label: 'Colorado' },
  { value: 'Denver', label: 'Denver, CO' },
  { value: 'California', label: 'California' },
  { value: 'San Francisco', label: 'San Francisco, CA' },
  { value: 'Los Angeles', label: 'Los Angeles, CA' },
  { value: 'New York', label: 'New York' },
  { value: 'New York City', label: 'New York City, NY' },
  { value: 'Washington', label: 'Washington' },
  { value: 'Seattle', label: 'Seattle, WA' },
  { value: 'Florida', label: 'Florida' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Atlanta', label: 'Atlanta, GA' },
  { value: 'North Carolina', label: 'North Carolina' },
  { value: 'Arizona', label: 'Arizona' },
  { value: 'Phoenix', label: 'Phoenix, AZ' },
  { value: 'Virginia', label: 'Virginia' },
  { value: 'Massachusetts', label: 'Massachusetts' },
  { value: 'Boston', label: 'Boston, MA' },
  { value: 'Pennsylvania', label: 'Pennsylvania' },
  { value: 'Oregon', label: 'Oregon' },
  { value: 'Austin', label: 'Austin, TX' },
  { value: 'Dallas', label: 'Dallas, TX' },
  { value: 'Houston', label: 'Houston, TX' },
  { value: 'Des Moines', label: 'Des Moines, IA' },
];

const MAX_LOCATION_SUGGESTIONS = 8;

function filterLocationOptions(query: string, options: typeof LOCATION_OPTIONS): typeof LOCATION_OPTIONS {
  const q = query.trim().toLowerCase();
  if (!q) return options.slice(0, MAX_LOCATION_SUGGESTIONS);
  const filtered = options.filter(
    (opt) => opt.label.toLowerCase().includes(q) || (opt.value && opt.value.toLowerCase().includes(q))
  );
  return filtered
    .sort((a, b) => {
      const aLabel = a.label.toLowerCase();
      const bLabel = b.label.toLowerCase();
      const aStarts = aLabel.startsWith(q) ? 1 : 0;
      const bStarts = bLabel.startsWith(q) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;
      return aLabel.localeCompare(bLabel);
    })
    .slice(0, MAX_LOCATION_SUGGESTIONS);
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading, initialFilters }) => {
  const [filters, setFilters] = useState<SearchFilters>({ ...defaultFilters, ...initialFilters });
  const [showFilters, setShowFilters] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const locationContainerRef = useRef<HTMLDivElement>(null);

  const locationSuggestions = filterLocationOptions(filters.location, LOCATION_OPTIONS);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationContainerRef.current && !locationContainerRef.current.contains(e.target as Node)) {
        setLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filters.keyword.trim()) {
      onSearch(filters);
    }
  };

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  React.useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters?.keyword, initialFilters?.location]);

  const toggleSource = (source: JobSource) => {
    const currentSources = filters.sources || [];
    if (currentSources.includes(source)) {
      if (currentSources.length > 1) {
        updateFilter('sources', currentSources.filter(s => s !== source));
      }
    } else {
      updateFilter('sources', [...currentSources, source]);
    }
  };

  const activeFilterCount = [
    filters.jobType,
    filters.remote,
    filters.experience,
    filters.datePosted,
    filters.salary,
    filters.easyApply,
    filters.under10Applicants,
  ].filter(Boolean).length;

  const selectClass = "w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white transition-colors";
  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all";

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => updateFilter('keyword', e.target.value)}
                placeholder="Job title or keywords"
                className={inputClass}
              />
            </div>
            
            <div className="flex-1 relative" ref={locationContainerRef}>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => {
                    updateFilter('location', e.target.value);
                    setLocationDropdownOpen(true);
                  }}
                  onFocus={() => setLocationDropdownOpen(true)}
                  placeholder="United States or type city, state..."
                  className={inputClass}
                  autoComplete="off"
                />
              </div>
              {locationDropdownOpen && (
                <ul
                  className="absolute z-50 left-0 right-0 mt-1 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-56 overflow-auto"
                  role="listbox"
                >
                  {locationSuggestions.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No matches — use as custom location</li>
                  ) : (
                    locationSuggestions.map((opt) => (
                      <li
                        key={opt.value || 'any'}
                        role="option"
                        className="px-3 py-2 text-sm cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:bg-blue-50 dark:focus:bg-blue-900/30"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          updateFilter('location', opt.value);
                          setLocationDropdownOpen(false);
                        }}
                      >
                        {opt.label}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !filters.keyword.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Jobs
              </>
            )}
          </button>
        </div>

        {/* Job Sources */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Sources:</span>
            {(Object.keys(SOURCE_INFO) as JobSource[]).map((source) => {
              const info = SOURCE_INFO[source];
              const isActive = filters.sources?.includes(source);
              return (
                <button
                  key={source}
                  type="button"
                  onClick={() => toggleSource(source)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? `${info.color} text-white shadow-sm`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{info.icon}</span>
                  <span>{info.name}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Tip: LinkedIn only is fastest; adding Indeed/Greenhouse can take longer.</p>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium px-1.5 py-0.5 rounded">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.easyApply}
                onChange={(e) => updateFilter('easyApply', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Easy Apply</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.details}
                onChange={(e) => updateFilter('details', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Full Details</span>
            </label>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Job Type</p>
              <div className="space-y-1">
                {[
                  { value: 'full-time', label: 'Full-time' },
                  { value: 'part-time', label: 'Part-time' },
                  { value: 'contract', label: 'Contract' },
                  { value: 'internship', label: 'Internship' },
                ].map(opt => {
                  const current = (filters.jobType || '').split(',').filter(Boolean);
                  const checked = current.includes(opt.value);
                  return (
                    <label key={opt.value} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const list = (filters.jobType || '').split(',').filter(Boolean);
                          const next = e.target.checked
                            ? Array.from(new Set([...list, opt.value]))
                            : list.filter(v => v !== opt.value);
                          updateFilter('jobType', next.join(','));
                        }}
                        className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Work Type</p>
              <div className="space-y-1">
                {[
                  { value: 'remote', label: 'Remote' },
                  { value: 'hybrid', label: 'Hybrid' },
                  { value: 'on-site', label: 'On-site' },
                ].map(opt => {
                  const current = (filters.remote || '').split(',').filter(Boolean);
                  const checked = current.includes(opt.value);
                  return (
                    <label key={opt.value} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const list = (filters.remote || '').split(',').filter(Boolean);
                          const next = e.target.checked
                            ? Array.from(new Set([...list, opt.value]))
                            : list.filter(v => v !== opt.value);
                          updateFilter('remote', next.join(','));
                        }}
                        className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Experience</p>
              <div className="space-y-1">
                {[
                  { value: 'internship', label: 'Internship' },
                  { value: 'entry-level', label: 'Entry Level' },
                  { value: 'associate', label: 'Associate' },
                  { value: 'senior', label: 'Senior' },
                  { value: 'director', label: 'Director' },
                ].map(opt => {
                  const current = (filters.experience || '').split(',').filter(Boolean);
                  const checked = current.includes(opt.value);
                  return (
                    <label key={opt.value} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const list = (filters.experience || '').split(',').filter(Boolean);
                          const next = e.target.checked
                            ? Array.from(new Set([...list, opt.value]))
                            : list.filter(v => v !== opt.value);
                          updateFilter('experience', next.join(','));
                        }}
                        className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <select
              value={filters.datePosted}
              onChange={(e) => updateFilter('datePosted', e.target.value)}
              className={selectClass}
            >
              <option value="">Date Posted</option>
              <option value="24hr">Past 24 hours</option>
              <option value="past-week">Past week</option>
              <option value="past-month">Past month</option>
            </select>

            <select
              value={filters.limit}
              onChange={(e) => updateFilter('limit', Number(e.target.value))}
              className={selectClass}
            >
              <option value="12">12 results (faster)</option>
              <option value="20">20 results</option>
              <option value="25">25 results</option>
              <option value="50">50 results</option>
            </select>
          </div>
        )}
      </div>
    </form>
  );
};
