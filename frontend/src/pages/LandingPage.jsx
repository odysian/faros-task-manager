import { useEffect } from 'react';
import { ExternalLink, FileText, Github, ListChecks, Users } from 'lucide-react';
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
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-4 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            Collaborative task management with sharing permissions, comments,
            file attachments, and activity history in one focused workspace.
          </p>
          <p className="text-sm text-zinc-500 max-w-xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            Built with FastAPI, PostgreSQL, Redis, React, and AWS.
          </p>

          {/* CTA Buttons */}
          <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
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
                Create Account
              </button>
            </div>

            <div className="mx-auto mt-8 w-fit max-w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-center gap-2 text-zinc-300">
                <Github size={16} className="text-emerald-400" />
                <p className="text-sm font-semibold">Open Source Project</p>
              </div>
              <p className="mb-4 text-xs text-zinc-500">
                Review the implementation and architecture in the monorepo.
              </p>
              <div className="flex justify-center">
                <a
                  href="https://github.com/odysian/faros-task-manager"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-emerald-300 transition-colors hover:border-zinc-600 hover:text-emerald-200"
                >
                  View FAROS on GitHub <ExternalLink size={14} />
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

      </div>
    </div>
  );
}

export default LandingPage;
