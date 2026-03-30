import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Stethoscope, Clock, ArrowRight, Shield, Activity } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import FooterSection from "@/components/footer";

// HEADER / HERO
const Header = () => {
  return (
    <div className="mb-16">
      {/* Hero */}
      <div className="bg-muted">
        <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
          <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
            <div>
              <Badge className="mb-4 rounded-full uppercase tracking-wider text-xs">
                Now accepting patients
              </Badge>
            </div>
            <h2 className="max-w-lg mb-6 text-3xl font-bold leading-none tracking-tight text-foreground sm:text-4xl md:mx-auto">
              <span className="relative inline-block">
                <svg
                  viewBox="0 0 52 24"
                  fill="currentColor"
                  className="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-muted-foreground/20 lg:w-32 lg:-ml-28 lg:-mt-10 sm:block"
                >
                  <defs>
                    <pattern id="hero-dots" x="0" y="0" width=".135" height=".30">
                      <circle cx="1" cy="1" r=".7" />
                    </pattern>
                  </defs>
                  <rect fill="url(#hero-dots)" width="52" height="24" />
                </svg>
                <span className="relative">Your Health,</span>
              </span>{" "}
              Our Priority
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Book appointments with top doctors, manage your health records, and
              get the care you deserve — all in one place.
            </p>
          </div>

          <div className="flex items-center gap-4 sm:justify-center">
            <Button asChild size="lg">
              <Link href="/appointment">
                Book Appointment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/doctors">Find Doctors</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="relative px-4 sm:px-0">
        <div className="absolute inset-0 bg-muted h-1/2" />
        <div className="relative grid mx-auto overflow-hidden bg-card border divide-y rounded-lg shadow-sm sm:divide-y-0 sm:divide-x sm:max-w-screen-sm sm:grid-cols-3 lg:max-w-screen-md">
          {[
            { icon: Calendar, label: "Easy Booking" },
            { icon: Stethoscope, label: "Expert Doctors" },
            { icon: Clock, label: "24/7 Support" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="inline-block p-8 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <p className="font-bold tracking-wide text-card-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// CONTENT / FEATURES
const Content = () => {
  const items = [
    {
      title: "Instant Appointment Booking",
      body: "Reserve your slot in seconds with real-time availability across all our specialists.",
    },
    {
      title: "Verified Medical Professionals",
      body: "Every physician is board-certified and peer-reviewed before joining the platform.",
    },
    {
      title: "Secure Health Records",
      body: "Your records are encrypted and accessible only to you and your care team.",
    },
    {
      title: "Round-the-Clock Support",
      body: "Our care coordinators are available 24/7 for anything you need.",
    },
  ];

  return (
    <div className="relative px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
      <div className="absolute inset-0">
        <div className="absolute inset-y-0 z-0 w-full h-full bg-muted/50 lg:w-3/4" />
      </div>
      <div className="relative">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Feature grid */}
          <div className="grid gap-8 md:grid-cols-2">
            {items.map(({ title, body }) => (
              <div key={title} className="relative">
                <div className="flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-primary/10">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h6 className="mb-2 font-semibold leading-5 text-foreground">{title}</h6>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>

          {/* Image */}
          <div>
            <img
              className="object-cover w-full h-56 rounded-lg shadow-md sm:h-96"
              src="https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
              alt="Doctor consultation"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// STEPS 
const Step = () => {
  const steps = [
    {
      title: "Create Account",
      body: "Sign up in under a minute. No credit card required to get started.",
    },
    {
      title: "Find a Doctor",
      body: "Browse specialists by category, availability, or location near you.",
    },
    {
      title: "Book Appointment",
      body: "Pick a time that works for you. Instant confirmation, no back and forth.",
    },
    {
      title: "Get Care",
      body: "Attend in-person or via video call. Your health records are waiting.",
    },
  ];

  return (
    <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
      <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        <Badge className="mb-4 rounded-full uppercase tracking-wider text-xs">
          How it works
        </Badge>
        <h2 className="max-w-lg mb-6 text-3xl font-bold leading-none tracking-tight text-foreground sm:text-4xl md:mx-auto">
          <span className="relative inline-block">
            <svg
              viewBox="0 0 52 24"
              fill="currentColor"
              className="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-muted-foreground/20 lg:w-32 lg:-ml-28 lg:-mt-10 sm:block"
            >
              <defs>
                <pattern id="step-dots" x="0" y="0" width=".135" height=".30">
                  <circle cx="1" cy="1" r=".7" />
                </pattern>
              </defs>
              <rect fill="url(#step-dots)" width="52" height="24" />
            </svg>
            <span className="relative">From signup</span>
          </span>{" "}
          to care in four steps
        </h2>
        <p className="text-base text-muted-foreground md:text-lg">
          Getting the care you need has never been simpler. Here's how MediBook
          works from start to finish.
        </p>
      </div>

      <div className="relative grid gap-6 mb-8 md:gap-8 lg:grid-cols-4 sm:grid-cols-2">
        {/* Connecting line */}
        <div className="absolute inset-0 flex items-center justify-center sm:hidden lg:flex pointer-events-none">
          <div className="w-px h-full bg-border lg:w-full lg:h-px" />
        </div>

        {steps.map(({ title, body }, i) => (
          <div
            key={title}
            className="relative p-5 bg-card border rounded-lg shadow-sm transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-base font-bold text-card-foreground">{title}</p>
              <span className="flex items-center justify-center w-6 h-6 text-xs font-bold rounded bg-primary/10 text-primary">
                {i + 1}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button asChild size="lg">
          <Link href="/appointment">
            Book Your Appointment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

// STATISTICS 
const Statistic = () => {
  const stats = [
    { value: "500+", label: "Expert Doctors", body: "Board-certified specialists across 20+ medical fields." },
    { value: "10K+", label: "Happy Patients", body: "Patients who've found consistent, quality care through MediBook." },
    { value: "98%", label: "Satisfaction Rate", body: "Of our patients rate their experience as excellent or very good." },
    { value: "24/7", label: "Always Available", body: "Care coordination support available around the clock, every day." },
  ];

  return (
    <div className="bg-muted/50">
      <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ value, label, body }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 sm:w-12 sm:h-12">
                <Shield className="w-5 h-5 text-primary sm:w-6 sm:h-6" />
              </div>
              <h6 className="text-4xl font-bold text-primary mb-1">{value}</h6>
              <p className="mb-2 font-bold text-foreground">{label}</p>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// BLOG / HEALTH TIPS 
const Blog = () => {
  const posts = [
    {
      category: "Preventive Care",
      date: "12 Jan 2025",
      title: "5 Health Screenings Everyone Should Schedule This Year",
      excerpt:
        "Regular screenings catch issues before they become serious. Here's what to prioritise based on your age and lifestyle.",
      author: "Dr. Sarah Wanjiku",
      role: "General Practitioner",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    },
    {
      category: "Mental Health",
      date: "3 Feb 2025",
      title: "Why Your Mental Health Appointment Matters as Much as Any Other",
      excerpt:
        "Stigma around mental healthcare is fading. Here's how to find the right professional and what to expect at your first session.",
      author: "Dr. James Ochieng",
      role: "Psychiatrist",
      avatar: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    },
    {
      category: "Nutrition",
      date: "20 Mar 2025",
      title: "How to Talk to Your Doctor About Your Diet",
      excerpt:
        "Nutrition is often overlooked in GP visits. These simple tips help you make the most of your appointment time.",
      author: "Dr. Amina Hassan",
      role: "Dietitian",
      avatar: "https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
    },
  ];

  return (
    <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
      {/* Section header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <Badge variant="outline" className="mb-3 rounded-full uppercase tracking-wider text-xs">
            Health Tips
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            From our doctors
          </h2>
        </div>
        <Button asChild variant="ghost" className="hidden sm:flex">
          <Link href="/blog">
            View all articles <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 sm:max-w-sm sm:mx-auto lg:max-w-full">
        {posts.map(({ category, date, title, excerpt, author, role, avatar }) => (
          <div
            key={title}
            className="p-8 bg-card border rounded-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
          >
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wide uppercase">
                <span className="text-primary">{category}</span>{" "}
                <span className="text-muted-foreground">— {date}</span>
              </p>
              <h3 className="mb-3 text-xl font-bold leading-snug text-card-foreground hover:text-primary transition-colors duration-200 cursor-pointer">
                {title}
              </h3>
              <p className="mb-5 text-sm text-muted-foreground leading-relaxed">{excerpt}</p>
            </div>
            <div className="flex items-center">
              <img
                src={avatar}
                alt={author}
                className="object-cover w-10 h-10 rounded-full mr-3 shadow-sm"
              />
              <div>
                <p className="font-semibold text-sm text-card-foreground">{author}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// PAGE 
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Header />
        <Content />
        <Step />
        <Statistic />
        <Blog />

        {/* CTA Banner */}
        <section className="py-6 container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="rounded-2xl bg-primary text-primary-foreground px-10 py-14 md:px-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Ready to get started?
              </h2>
              <p className="opacity-80 max-w-md">
                Join thousands of patients who trust MediBook for their everyday
                healthcare needs.
              </p>
            </div>
            <Button asChild variant="secondary" size="lg" className="shrink-0">
              <Link href="/appointment">
                Book Your First Appointment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  );
}