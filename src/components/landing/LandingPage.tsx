import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="font-sans text-gray-800">
      {/* Hero Section */}
      <div
className="h-screen bg-[url('/assets/images/flag-kenya.png')] bg-cover bg-center flex items-center justify-center relative">
     
      
        <div className="absolute inset-0 bg-opacity-60"></div>
        <div className="relative z-10 text-center px-6 max-w-3xl text-gray-200">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Empowering Citizens, Strengthening Leadership
          </h1>
          <p className="text-lg sm:text-xl mb-6">
            Evaluate the performance of your leaders on issues that matter most
            to your region. From the presidency to your local MCA, your opinion
            counts.
          </p>
          <Link
            to="/login"
            className="bg-[#007E66] text-white font-semibold px-6 py-3 rounded hover:bg-green-700 transition"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* About Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-[#007E66] mb-4">
          About the Platform
        </h2>
        <p className="text-lg text-gray-700">
          This platform was built to give every Kenyan citizen a voice in
          evaluating the performance of elected leaders. By rating leaders based
          on key development areas like infrastructure, education, health, and
          accountability, citizens can promote transparency, demand better
          service delivery, and foster responsible governance.
        </p>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-100 px-6">
        <h2 className="text-3xl font-bold text-center text-[#007E66] mb-10">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">
          <div>
            <div className="text-5xl mb-4">🧑🏽‍🤝‍🧑🏿</div>
            <h3 className="text-xl font-semibold mb-2">1. Sign Up</h3>
            <p>Create your account and select your region of residence.</p>
          </div>
          <div>
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">2. Review Leaders</h3>
            <p>
              Rate your leaders based on performance in your county, constituency or
              ward.
            </p>
          </div>
          <div>
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">3. See Reports</h3>
            <p>
              View overall performance scores, compare leaders and see top
              performers.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-[#007E66] mb-6 text-center">
          Why This Matters
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
          <li>✅ Promote government transparency and accountability</li>
          <li>✅ Help citizens make informed decisions during elections</li>
          <li>✅ Give a voice to grassroots issues and feedback</li>
          <li>✅ Encourage leaders to improve performance</li>
        </ul>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-[#007E66] text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Your Voice. Your Power.</h2>
        <p className="text-lg mb-6">
          Join thousands of Kenyans who are making a difference in leadership
          evaluation.
        </p>
        <Link
          to="/login"
          className="bg-white text-[#007E66] font-semibold px-6 py-3 rounded hover:bg-gray-100 transition"
        >
          Start Evaluating
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-6">
        <p>
          &copy; {new Date().getFullYear()} Kenya Leadership Evaluation Platform
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
