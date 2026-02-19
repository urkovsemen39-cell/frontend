'use client';

import { useState, FormEvent } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : 'scale-100'}`}>
        <div className="flex gap-3 relative">
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <svg 
              className={`w-6 h-6 transition-colors duration-300 ${
                isFocused ? 'text-blue-600' : 'text-gray-400'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Что вы ищете? (например: ноутбук, телефон, кроссовки)"
            className={`flex-1 pl-14 pr-4 py-4 rounded-2xl text-lg transition-all duration-300 outline-none ${
              isFocused
                ? 'glass-effect shadow-xl ring-2 ring-blue-500'
                : 'bg-white shadow-md hover:shadow-lg'
            }`}
            disabled={loading}
          />

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={`px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 ${
              loading || !query.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-105 pulse-glow'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Поиск...</span>
              </div>
            ) : (
              'Найти'
            )}
          </button>
        </div>

        {/* Decorative gradient line */}
        {isFocused && (
          <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full animate-pulse"></div>
        )}
      </div>
    </form>
  );
}
