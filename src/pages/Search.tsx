import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search as SearchIcon, Users, FileText, Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import PostCard from '@/components/Post/PostCard';
import UserCard from '@/components/User/UserCard';
import { usePosts } from '@/hooks/usePosts';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const { users, posts, loading, search, clearResults } = useSearch();
  const { toggleLike } = usePosts();

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      await search(searchQuery);
    } else {
      setSearchParams({});
      clearResults();
    }
  }, [search, clearResults, setSearchParams]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query, handleSearch]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg pb-4">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users and posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-4 h-12 text-lg rounded-full border-border/50 bg-card"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : query.trim() ? (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start mb-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                  {users.length + posts.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{users.length}</span>
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Posts
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{posts.length}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {users.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    People
                  </h3>
                  <div className="grid gap-3">
                    {users.slice(0, 3).map((user) => (
                      <UserCard key={user.id} profile={user} />
                    ))}
                  </div>
                  {users.length > 3 && (
                    <Link
                      to={`?q=${query}&tab=users`}
                      className="block text-center text-primary hover:underline mt-3"
                    >
                      See all {users.length} users
                    </Link>
                  )}
                </div>
              )}

              {posts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Posts
                  </h3>
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} onLike={() => toggleLike(post.id)} />
                    ))}
                  </div>
                </div>
              )}

              {users.length === 0 && posts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No results found for "{query}"</p>
                  <p className="text-sm">Try different keywords</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-3">
              {users.map((user) => (
                <UserCard key={user.id} profile={user} />
              ))}
              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onLike={() => toggleLike(post.id)} />
              ))}
              {posts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No posts found
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <SearchIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Search for users and posts</p>
            <p className="text-sm">Enter a name, username, or keyword to search</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
