import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Stethoscope, UserCircle, ArrowRight, Star, Shield, Heart } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import FooterSection from "@/components/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div>
        {/* Hero Section */}
        <section className="py-20 md:py-32 animate-fade-up">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
                Your Health, Our Priority
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in animation-delay-200">
                Book appointments with top doctors, manage your health records, and get the care you deserve - all in one place.
              </p>
              <div className="flex gap-4 justify-center animate-fade-in animation-delay-400">
                <Button asChild size="lg" className="transition-all duration-300 hover:scale-105">
                  <Link href="/appointment">
                    Book Appointment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="transition-all duration-300 hover:scale-105">
                  <Link href="/doctors">
                    Find Doctors
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/50 animate-fade-up animation-delay-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose MediBook?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in animation-delay-300">
                <CardHeader>
                  <Calendar className="h-12 w-12 text-primary mb-2 transition-transform duration-300 group-hover:scale-110" />
                  <CardTitle>Easy Booking</CardTitle>
                  <CardDescription>
                    Book appointments with just a few clicks, anytime anywhere
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in animation-delay-400">
                <CardHeader>
                  <Stethoscope className="h-12 w-12 text-primary mb-2 transition-transform duration-300 group-hover:scale-110" />
                  <CardTitle>Expert Doctors</CardTitle>
                  <CardDescription>
                    Access to qualified and experienced medical professionals
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in animation-delay-500">
                <CardHeader>
                  <Clock className="h-12 w-12 text-primary mb-2 transition-transform duration-300 group-hover:scale-110" />
                  <CardTitle>24/7 Support</CardTitle>
                  <CardDescription>
                    Round-the-clock assistance for all your healthcare needs
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 animate-fade-up animation-delay-400">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="animate-fade-in animation-delay-500">
                <div className="text-4xl font-bold text-primary mb-2 transition-all duration-300 hover:scale-110 inline-block">500+</div>
                <div className="text-muted-foreground">Expert Doctors</div>
              </div>
              <div className="animate-fade-in animation-delay-600">
                <div className="text-4xl font-bold text-primary mb-2 transition-all duration-300 hover:scale-110 inline-block">10K+</div>
                <div className="text-muted-foreground">Happy Patients</div>
              </div>
              <div className="animate-fade-in animation-delay-700">
                <div className="text-4xl font-bold text-primary mb-2 transition-all duration-300 hover:scale-110 inline-block">20+</div>
                <div className="text-muted-foreground">Specialties</div>
              </div>
              <div className="animate-fade-in animation-delay-800">
                <div className="text-4xl font-bold text-primary mb-2 transition-all duration-300 hover:scale-110 inline-block">98%</div>
                <div className="text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground animate-fade-up animation-delay-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4 animate-fade-in">Ready to Get Started?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90 animate-fade-in animation-delay-200">
              Join thousands of patients who trust MediBook for their healthcare needs
            </p>
            <Button asChild variant="secondary" size="lg" className="transition-all duration-300 hover:scale-105 animate-fade-in animation-delay-400">
              <Link href="/appointment">Book Your First Appointment</Link>
            </Button>
          </div>
        </section>
      </div>
      <FooterSection />
    </>
  );
}