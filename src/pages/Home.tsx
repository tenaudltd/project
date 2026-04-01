import { Link } from "react-router-dom";
import { BookOpen, Users, Award, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary-50 relative overflow-hidden">
          <div
            className="absolute inset-0 z-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, #0ea5e9 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="container relative z-10 px-4 md:px-6 max-w-6xl mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-gray-900">
                  Empowering{" "}
                  <span className="text-primary-600">Mushindamo</span> Through
                  Knowledge
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl lg:text-2xl pt-4">
                  A digital platform designed to enhance civic awareness,
                  promote transparency, and encourage community participation in
                  local governance.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-none justify-center">
                <Link
                  to="/register"
                  className="rounded-xl px-8 py-4 bg-primary-600 text-white font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center"
                >
                  Start Learning Now
                </Link>
                <Link
                  to="/about"
                  className="rounded-xl px-8 py-4 bg-white text-gray-700 font-semibold border-2 border-gray-200 hover:border-primary-200 hover:bg-primary-50 transition-all duration-300 text-lg flex items-center justify-center"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-16 lg:py-24 bg-white">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Platform Features
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Everything you need to engage with local governance.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Interactive Modules
                </h3>
                <p className="text-gray-600">
                  Access structured learning materials covering budgeting, land
                  administration, and more.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Assessments
                </h3>
                <p className="text-gray-600">
                  Test your knowledge with quizzes and earn recognition for your
                  civic education progress.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Community Feedback
                </h3>
                <p className="text-gray-600">
                  Share your thoughts and participate in local decision-making
                  processes transparently.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Digital Governance
                </h3>
                <p className="text-gray-600">
                  Stay informed with secure, direct announcements from the
                  Mushindamo Town Council.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 py-12 text-gray-400">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-xl font-bold text-white">
              CivicEd Mushindamo
            </span>
            <p className="text-sm">
              Empowering citizens through accessible governance information.
            </p>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Mushindamo Town Council. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
