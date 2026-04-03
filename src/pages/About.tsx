import { Flag, History } from "lucide-react";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 bg-white border-b border-gray-200">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6 text-gray-900">
              About Civic Education at{" "}
              <span className="text-primary-600">Mushindamo</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mx-auto">
              Mushindamo Town Council is committed to bridging the governance
              gap between the local authority and its citizens. Our Web-Based
              Civic Education Learning Platform is a critical step towards
              transparent, inclusive, and decentralized governance.
            </p>
          </div>
        </section>

        <section className="w-full py-16">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto grid gap-8 md:grid-cols-2">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                <Flag className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To equip the citizens of Mushindamo with the knowledge and tools
                necessary to actively participate in local governance,
                understand their rights and responsibilities, and contribute to
                sustainable community development.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                The Background
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Historically, civic education relied on traditional face-to-face
                sensitization meetings which were limited by geography and
                resources. This platform modernizes our approach, ensuring that
                structured, digital, and interactive learning is accessible to
                everyone in the district.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12 text-gray-900">
              Why Use This Platform?
            </h2>

            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    Demystify Local Governance
                  </h3>
                  <p className="text-gray-600">
                    Understand how the Town Council operates, from the
                    Constituency Development Fund (CDF) allocation to local
                    budget planning and service delivery standards.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    Interactive Curriculum
                  </h3>
                  <p className="text-gray-600">
                    Engage with multimedia modules created by council experts.
                    Learn at your own pace from your mobile device or computer.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    Verify Your Knowledge
                  </h3>
                  <p className="text-gray-600">
                    Take automated assessments to track your understanding of
                    civic duties and transparent administration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
