import { useEffect } from 'react';
import { FileText, ListChecks, Users } from 'lucide-react';
import { healthService } from '../services/healthService';
import { THEME } from '../styles/theme';

function LandingPage({ onNavigateToLogin, onNavigateToRegister }) {
  useEffect(() => {
    const controller = new AbortController();

    healthService
      .warmUpBackend({ signal: controller.signal })
      .catch(() => null);

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8 animate-in fade-in zoom-in duration-700">
            <span className="text-7xl text-emerald-500 filter drop-shadow-[0_0_20px_rgba(16,185,129,.9)]">
              ⟡
            </span>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-7xl font-black tracking-tight text-emerald-50 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            FAROS
          </h1>
          <p className="text-xl md:text-2xl text-emerald-500 font-medium tracking-wide mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Navigate your backlog
          </p>

          {/* Description */}
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            A task management platform designed to help you organize,
            prioritize, and track your work. Stay focused, stay productive, and
            navigate your projects with clarity.
          </p>

          {/* CTA Buttons */}
          <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onNavigateToLogin}
                className={`${THEME.button.primary} w-full sm:w-auto px-8 py-4 text-lg`}
              >
                Sign In
              </button>
              <button
                onClick={onNavigateToRegister}
                className={`${THEME.button.secondary} w-full sm:w-auto px-8 py-4 text-lg`}
              >
                Get Started
              </button>
            </div>
            <div className="mt-4 text-sm text-zinc-400">
              <p className="mb-1">Project repos:</p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
                <a
                  href="https://github.com/odysian/task-manager-api"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                  Backend
                </a>
                <a
                  href="https://github.com/odysian/task-manager-frontend"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                  Frontend
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-5xl mx-auto mt-32 mb-20">
          <h2 className="text-3xl font-bold text-center text-emerald-50 mb-12">
            Everything you need to manage tasks
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className={`${THEME.card} p-6 text-center`}>
              <div className="flex justify-center mb-4">
                <ListChecks
                  size={40}
                  className="text-emerald-500"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-xl font-bold text-emerald-50 mb-2">
                Task Organization
              </h3>
              <p className="text-zinc-400 text-sm">
                Create, organize, and manage your tasks with an intuitive
                interface designed for productivity.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`${THEME.card} p-6 text-center`}>
              <div className="flex justify-center mb-4">
                <Users
                  size={40}
                  className="text-emerald-500"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-xl font-bold text-emerald-50 mb-2">
                Team Collaboration
              </h3>
              <p className="text-zinc-400 text-sm">
                Share tasks, add comments, and collaborate with your team
                members in real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`${THEME.card} p-6 text-center`}>
              <div className="flex justify-center mb-4">
                <FileText
                  size={40}
                  className="text-emerald-500"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-xl font-bold text-emerald-50 mb-2">
                File Management
              </h3>
              <p className="text-zinc-400 text-sm">
                Attach files to tasks, download documents, and keep all your
                project assets organized in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="max-w-2xl mx-auto text-center py-12 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm mb-6">
            Ready to get started?
          </p>
          <button
            onClick={onNavigateToRegister}
            className={`${THEME.button.primary} px-8 py-3`}
          >
            Create Your Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
