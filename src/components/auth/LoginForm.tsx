import { useState } from 'react';
import { supabase, testSupabaseConnection } from '../../lib/supabase';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    let retryCount = 0;
    const maxRetries = 3;

    try {
      while (retryCount < maxRetries) {
        try {
          // Test connection before attempting login
          const isConnected = await testSupabaseConnection();
          if (!isConnected) {
            retryCount++;
            if (retryCount === maxRetries) {
              throw new Error('Unable to connect to the authentication service after multiple attempts');
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            continue;
          }

          const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (authError) {
            throw authError;
          }

          // Success - break out of retry loop
          break;
        } catch (err) {
          if (retryCount === maxRetries - 1) {
            throw err;
          }
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      // If we get here, login was successful
      navigate('/admin');
    } catch (err) {
      const error = err as Error;
      setError(
        error.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : 'Unable to connect to authentication service. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <LogIn className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 mb-2">
            Sign in to your account
          </h2>
          <p className="text-center text-sm text-gray-600">
            Use your admin email and password
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}