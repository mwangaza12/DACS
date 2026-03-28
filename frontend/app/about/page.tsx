import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Target, Award, Stethoscope, Clock } from "lucide-react";
import { Navbar } from "@/components/navbar";
import FooterSection from "@/components/footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About MediBook</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Revolutionizing healthcare access through technology and compassion
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div className="animate-fade-in animation-delay-200">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                To provide seamless, accessible, and quality healthcare services through innovative technology, 
                connecting patients with trusted medical professionals.
              </p>
              <p className="text-muted-foreground">
                We believe that healthcare should be simple, transparent, and available to everyone. 
                Our platform bridges the gap between patients and doctors, making quality care just a click away.
              </p>
            </div>
            <div className="bg-muted rounded-lg p-6 animate-fade-in animation-delay-400 transition-all duration-300 hover:scale-105">
              <h3 className="text-xl font-semibold mb-4">Our Values</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 transition-all duration-300 hover:translate-x-2">
                  <Heart className="h-5 w-5 text-primary mt-1" />
                  <span>Compassionate Care</span>
                </div>
                <div className="flex items-start gap-3 transition-all duration-300 hover:translate-x-2">
                  <Users className="h-5 w-5 text-primary mt-1" />
                  <span>Patient First</span>
                </div>
                <div className="flex items-start gap-3 transition-all duration-300 hover:translate-x-2">
                  <Target className="h-5 w-5 text-primary mt-1" />
                  <span>Innovation & Excellence</span>
                </div>
                <div className="flex items-start gap-3 transition-all duration-300 hover:translate-x-2">
                  <Award className="h-5 w-5 text-primary mt-1" />
                  <span>Trust & Transparency</span>
                </div>
              </div>
            </div>
          </div>

          {/* What We Offer */}
          <div className="mb-16 animate-fade-up animation-delay-400">
            <h2 className="text-3xl font-bold text-center mb-8">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in animation-delay-500">
                <CardHeader>
                  <Stethoscope className="h-8 w-8 text-primary mb-2 transition-transform duration-300 group-hover:scale-110" />
                  <CardTitle>Expert Doctors</CardTitle>
                  <CardDescription>
                    Verified and experienced specialists across various medical fields
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in animation-delay-600">
                <CardHeader>
                  <Clock className="h-8 w-8 text-primary mb-2 transition-transform duration-300 group-hover:scale-110" />
                  <CardTitle>Easy Scheduling</CardTitle>
                  <CardDescription>
                    Book appointments at your convenience with flexible time slots
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in animation-delay-700">
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2 transition-transform duration-300 group-hover:scale-110" />
                  <CardTitle>Patient Support</CardTitle>
                  <CardDescription>
                    Dedicated support team to assist you throughout your healthcare journey
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-primary/5 rounded-lg p-8 text-center animate-fade-up animation-delay-600">
            <h2 className="text-2xl font-bold mb-6">Our Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="animate-fade-in animation-delay-700">
                <div className="text-3xl font-bold text-primary transition-all duration-300 hover:scale-110 inline-block">2024</div>
                <div className="text-sm text-muted-foreground">Founded</div>
              </div>
              <div className="animate-fade-in animation-delay-800">
                <div className="text-3xl font-bold text-primary transition-all duration-300 hover:scale-110 inline-block">50+</div>
                <div className="text-sm text-muted-foreground">Partner Clinics</div>
              </div>
              <div className="animate-fade-in animation-delay-900">
                <div className="text-3xl font-bold text-primary transition-all duration-300 hover:scale-110 inline-block">15K+</div>
                <div className="text-sm text-muted-foreground">Appointments Booked</div>
              </div>
              <div className="animate-fade-in animation-delay-1000">
                <div className="text-3xl font-bold text-primary transition-all duration-300 hover:scale-110 inline-block">4.9</div>
                <div className="text-sm text-muted-foreground">Patient Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterSection />
    </>
  );
}