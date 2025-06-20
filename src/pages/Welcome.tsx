// src/pages/Welcome.tsx

import { Link } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogIn, UserPlus, Shield, Search, FileText, ArrowRight, CheckCircle } from 'lucide-react'

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">

      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">

          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Compliance Tracker</h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Transform Your
              <span className="text-primary block">Compliance</span>
              Into Intelligence
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Reduce audit preparation time by 80% and avoid costly compliance violations with AI-powered policy search. 
              <strong className="text-foreground"> Login or signup to begin</strong> your regulatory readiness journey.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button asChild size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
              <Link to="/login" className="flex items-center space-x-2">
                <LogIn className="h-5 w-5" />
                <span>Login to Continue</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
              <Link to="/signup" className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Create Free Account</span>
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Get started in seconds</span>
            </div>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Search className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Instant Policy Search</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Find regulatory requirements across hundreds of documents in seconds. Ask "What's our GDPR data retention policy?" 
                and get precise answers with source citations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Audit-Ready Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Complete audit trails and source documentation for every compliance query. 
                Demonstrate due diligence with comprehensive evidence chains for regulatory reviews.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Risk Mitigation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Avoid costly compliance violations with centralized, searchable knowledge base. 
                Reduce human error and ensure consistent application of regulatory requirements.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">How It Works</h3>
            <p className="text-lg text-muted-foreground">
              Streamline compliance management in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                  1
                </div>
              </div>
              <h4 className="text-xl font-semibold">Upload Policies</h4>
              <p className="text-muted-foreground">
                Upload your compliance documents, SOPs, and regulatory frameworks to create your policy knowledge base
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                  2
                </div>
              </div>
              <h4 className="text-xl font-semibold">Ask Compliance Questions</h4>
              <p className="text-muted-foreground">
                Query requirements like "What are breach notification timelines?" and get instant, accurate answers
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                  3
                </div>
              </div>
              <h4 className="text-xl font-semibold">Generate Audit Evidence</h4>
              <p className="text-muted-foreground">
                Receive documented answers with complete source citations and audit trails for regulatory reviews
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl font-bold">Ready to Streamline Compliance?</CardTitle>
              <CardDescription className="text-lg mt-2">
                Join compliance officers who have reduced audit preparation time by 80%
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/signup" className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5" />
                    <span>Start Free Trial</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link to="/login" className="flex items-center space-x-2">
                    <LogIn className="h-5 w-5" />
                    <span>Already have an account?</span>
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Avoid costly violations</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Built-in audit trails</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">Compliance Tracker</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
              <Link to="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
              <span>© 2025 Compliance Tracker. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}