import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Stethoscope, UserCircle, ArrowRight, Star, Shield, Heart } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <Navbar />
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Your Health, Our Priority
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Book appointments with top doctors, manage your health records, and get the care you deserve - all in one place.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/appointment">
                  Book Appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/doctors">
                  Find Doctors
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose MediBook?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Easy Booking</CardTitle>
                <CardDescription>
                  Book appointments with just a few clicks, anytime anywhere
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Stethoscope className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Expert Doctors</CardTitle>
                <CardDescription>
                  Access to qualified and experienced medical professionals
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-2" />
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
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Expert Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Happy Patients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">20+</div>
              <div className="text-muted-foreground">Specialties</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of patients who trust MediBook for their healthcare needs
          </p>
          <Button asChild variant="secondary" size="lg">
            <Link href="/appointment">Book Your First Appointment</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}