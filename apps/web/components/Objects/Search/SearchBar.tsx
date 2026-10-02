import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  ArrowRight,
  Sparkles,
  BookCopy,
  Folder,
  ArrowUpRight,
  TextSearch,
  Users,
  X,
  Command,
  Loader2,
} from 'lucide-react';
import { searchOrgContent } from '@services/search/search';
import { useLHSession } from '@components/Contexts/LHSessionContext';
import Link from 'next/link';
import { getCourseThumbnailMediaDirectory, getUserAvatarMediaDirectory } from '@services/media/media';
import { useDebounce } from '@/hooks/useDebounce';
import { useOrg } from '@components/Contexts/OrgContext';
import { getUriWithOrg } from '@services/config/config';
import { safeImageSrc } from '@services/security/url';
import { removeCoursePrefix } from '../Thumbnails/CourseThumbnail';
import UserAvatar from '../UserAvatar';
import { useTranslation } from 'react-i18next';
import { useLHAnalytics, AnalyticsEvent } from '@services/analytics';
import { getMenuColorClasses } from '@services/utils/ts/colorUtils';

interface User {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_image: string;
  bio: string;
  details: Record<string, any>;
  profile: Record<string, any>;
  id: number;
  user_uuid: string;
}

interface Author {
  user: User;
  authorship: string;
  authorship_status: string;
  creation_date: string;
  update_date: string;
}

interface Course {
  name: string;
  description: string;
  about: string;
  learnings: string;
  tags: string;
  thumbnail_image: string;
  public: boolean;
  open_to_contributors: boolean;
  id: number;
  org_id: number;
  authors: Author[];
  course_uuid: string;
  creation_date: string;
  update_date: string;
}

interface FolderResult {
  name: string;
  public: boolean;
  description: string;
  id: number;
  courses: string[];
  folder_uuid: string;
  creation_date: string;
  update_date: string;
}

interface SearchResults {
  courses: Course[];
  folders: FolderResult[];
  users: User[];
}

interface SearchBarProps {
  orgslug: string;
  className?: string;
  isMobile?: boolean;
  showSearchSuggestions?: boolean;
  primaryColor?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  orgslug,
  className = '',
  isMobile = false,
  showSearchSuggestions = false,
  primaryColor = '',
}) => {
  const { t, i18n } = useTranslation();
  const isTr = i18n?.language?.startsWith('tr') !== false;
  const org = useOrg() as any;
  const { track } = useLHAnalytics('learner');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>({
    courses: [],
    folders: [],
    users: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const session = useLHSession() as any;
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 250);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Global Keyboard shortcut: Cmd+K / Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
      setSearchResults({ courses: [], folders: [], users: [] });
    }
  }, [isOpen]);

  // Fetch search results
  useEffect(() => {
    let stale = false;

    const fetchResults = async () => {
      if (debouncedSearch.trim().length === 0) {
        if (!stale) {
          setSearchResults({ courses: [], folders: [], users: [] });
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchOrgContent(
          orgslug,
          debouncedSearch,
          1,
          4,
          null,
          session?.data?.tokens?.access_token
        );

        if (stale) return;

        setSearchResults({
          courses: (response as any)?.courses || [],
          folders: (response as any)?.folders || [],
          users: (response as any)?.users || [],
        });
      } catch (err) {
        console.error('Search query error:', err);
      } finally {
        if (!stale) setIsLoading(false);
      }
    };

    fetchResults();

    return () => {
      stale = true;
    };
  }, [debouncedSearch, orgslug, session?.data?.tokens?.access_token]);

  const hasAnyResults =
    searchResults.courses.length > 0 ||
    searchResults.folders.length > 0 ||
    searchResults.users.length > 0;

  return (
    <>
      {/* HEADER ICON BUTTON TRIGGER */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Ara (⌘K)"
        className={`flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200/80 bg-gray-50/70 hover:bg-gray-100/90 text-gray-500 hover:text-gray-900 transition-all text-xs font-semibold cursor-pointer shadow-xs ${className}`}
      >
        <Search size={16} className="text-gray-500 shrink-0" />
        <span className="hidden md:inline text-[11px] text-gray-400 font-normal">
          {isTr ? 'Ara...' : 'Search...'}
        </span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white border border-gray-200 rounded">
          ⌘K
        </kbd>
      </button>

      {/* ANIMATED SPOTLIGHT MODAL (IN SCREEN CENTER VIA PORTAL) */}
      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] w-screen h-screen flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/60 backdrop-blur-md transition-all duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-200 animate-in fade-in zoom-in-95"
          >
            {/* Top Search Input Box */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-gray-100">
              <Search size={18} className="text-gray-400 shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isTr ? 'Ders, modül, pano veya kişi ara...' : 'Search courses, modules, boards...'}
                className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder-gray-400 outline-none"
              />

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {isLoading ? (
                  <Loader2 size={16} className="text-indigo-600 animate-spin" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2 py-1 text-[11px] font-mono font-bold text-gray-400 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  ESC
                </button>
              </div>
            </div>

            {/* Results or Empty State */}
            <div className="max-h-[60vh] overflow-y-auto p-3 space-y-3">
              {!searchQuery.trim() ? (
                /* Empty state / Quick shortcuts */
                <div className="py-6 px-4 text-center space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center font-bold">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-xs">
                      {isTr ? 'Okul İçeriğinde Arama Yapın' : 'Search School Content'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {isTr
                        ? 'Dersler, ödevler, interaktif modüller ve sınıf panolarına anında erişin.'
                        : 'Quickly find courses, assignments, interactive modules, and boards.'}
                    </p>
                  </div>

                  {/* Fast shortcut chips */}
                  <div className="flex items-center justify-center gap-2 pt-2 flex-wrap text-xs">
                    <button
                      type="button"
                      onClick={() => setSearchQuery('Matematik')}
                      className="px-2.5 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 cursor-pointer"
                    >
                      📐 Matematik
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('Okuma')}
                      className="px-2.5 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 cursor-pointer"
                    >
                      📖 Okuma
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('Fen')}
                      className="px-2.5 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 cursor-pointer"
                    >
                      🔬 Fen Bilgisi
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('İngilizce')}
                      className="px-2.5 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 cursor-pointer"
                    >
                      🇬🇧 İngilizce
                    </button>
                  </div>
                </div>
              ) : !isLoading && !hasAnyResults ? (
                /* No results found */
                <div className="py-8 text-center text-gray-400 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    "{searchQuery}" için sonuç bulunamadı
                  </p>
                  <p className="text-[11px]">Farklı bir arama terimi deneyebilirsiniz.</p>
                </div>
              ) : (
                /* Results List */
                <div className="space-y-3">
                  {/* Courses */}
                  {searchResults.courses.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <BookCopy size={13} />
                        <span>{isTr ? 'Dersler' : 'Courses'}</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {searchResults.courses.map((course) => (
                          <Link
                            key={course.course_uuid}
                            href={getUriWithOrg(
                              orgslug,
                              `/course/${removeCoursePrefix(course.course_uuid)}`
                            )}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-indigo-50/60 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                              <BookCopy size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-xs group-hover:text-indigo-600 truncate">
                                {course.name}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">
                                {course.description || 'Ders içeriği'}
                              </p>
                            </div>
                            <ArrowUpRight
                              size={14}
                              className="text-gray-300 group-hover:text-indigo-600 transition-colors"
                            />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Folders */}
                  {searchResults.folders.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <Folder size={13} />
                        <span>{isTr ? 'Klasörler & Kaynaklar' : 'Folders'}</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {searchResults.folders.map((folder) => (
                          <Link
                            key={folder.folder_uuid}
                            href={getUriWithOrg(
                              orgslug,
                              `/library/folder/${encodeURIComponent(
                                folder.folder_uuid.replace('folder_', '')
                              )}`
                            )}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-50 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                              <Folder size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-xs group-hover:text-gray-700 truncate">
                                {folder.name}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">
                                {folder.description || 'Kaynak klasörü'}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Users */}
                  {searchResults.users.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <Users size={13} />
                        <span>{isTr ? 'Kullanıcılar & Öğretmenler' : 'Users'}</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {searchResults.users.map((user) => (
                          <Link
                            key={user.user_uuid}
                            href={getUriWithOrg(
                              orgslug,
                              `/user/${encodeURIComponent(user.username)}`
                            )}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-50 transition-colors group"
                          >
                            <UserAvatar
                              width={36}
                              avatar_url={
                                user.avatar_image
                                  ? getUserAvatarMediaDirectory(
                                      user.user_uuid,
                                      user.avatar_image
                                    )
                                  : ''
                              }
                              predefined_avatar={
                                user.avatar_image ? undefined : 'empty'
                              }
                              userId={user.id.toString()}
                              rounded="rounded-full"
                              backgroundColor="bg-gray-100"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-xs group-hover:text-gray-700 truncate">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">
                                @{user.username}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View all link */}
                  <Link
                    href={getUriWithOrg(
                      orgslug,
                      `/search?q=${encodeURIComponent(searchQuery)}`
                    )}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/50 rounded-2xl transition-colors mt-2"
                  >
                    <span>"{searchQuery}" için tüm sonuçları gör</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom Keyboard Hint Bar */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-2">
                <span>↵ Aç</span>
                <span>•</span>
                <span>ESC Kapat</span>
              </span>
              <span>Spotlight Arama</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default SearchBar;
