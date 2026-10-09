import { useState } from 'react';
import { Sparkles, Shield, Clock, TrendingUp, Zap, ArrowRight, Globe, FileText } from 'lucide-react';
import ConsultationForm from '../components/ConsultationForm';
import Footer from '../components/Footer';
import Header from '../components/Header';
import ResultConsultation from '../components/ResultConsultation';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleConsultationComplete = (consultation: any) => {
    setResult(consultation);
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowForm(false)}
            className="mb-6 font-sans text-xs uppercase tracking-widest text-neutral-500 hover:text-black flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <ConsultationForm />
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <ResultConsultation result={result} onReset={() => setResult(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
      <Header showNav={true} showBackToHome={false} mobileMenu={true} />

      <section className="pt-32 pb-16 px-4 border-b-2 border-black">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="font-sans text-xs uppercase tracking-widest text-neutral-500">
              [ 01 / Hero ]
            </span>
            <div className="h-px flex-1 bg-black" />
            <span className="inline-flex items-center gap-2 bg-black text-yellow-300 px-3 py-1 text-xs font-sans uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Smart Engine
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
            Cross-Border
            <br />
            Tax{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Made Simple</span>
              <span className="absolute left-0 bottom-1 w-full h-4 bg-yellow-300 -z-0" />
            </span>
          </h1>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <p className="text-lg text-neutral-700 leading-relaxed">
              Get instant, accurate analysis of your cross-border employment situation between Slovenia and Italy.
            </p>
            <div className="flex flex-col gap-3 font-sans text-xs uppercase tracking-widest">
              <div className="flex items-center gap-3 border-b border-dashed border-neutral-400 pb-2">
                <Clock className="w-4 h-4" />
                <span>01 min to complete</span>
              </div>
              <div className="flex items-center gap-3 border-b border-dashed border-neutral-400 pb-2">
                <Shield className="w-4 h-4" />
                <span>100% compliant</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4" />
                <span>10+ rules analyzed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="consultation-form" className="py-16 px-4 border-b-2 border-black bg-white">
        <div className="max-w-6xl mx-auto">
          <ConsultationForm />
        </div>
      </section>

      <section id="how-it-works" className="py-16 px-4 border-b-2 border-black">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="font-sans text-xs uppercase tracking-widest text-neutral-500 block mb-3">
                [ 02 / Process ]
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                How It Works
              </h2>
            </div>
            <p className="font-sans text-xs uppercase tracking-widest text-neutral-500">
              Three steps →
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-black">
            {[
              {
                step: '01',
                title: 'Answer Questions',
                description: 'Tell us about your residence and employment situation.'
              },
              {
                step: '02',
                title: 'Rule-Based Analysis',
                description: 'Our engine analyzes against 10+ tax rules automatically.'
              },
              {
                step: '03',
                title: 'Get Results',
                description: 'Receive requirements and document checklist instantly.'
              }
            ].map((step, index) => (
              <div
                key={index}
                className={`p-8 ${index !== 2 ? 'md:border-r-2 border-b-2 md:border-b-0 border-black' : ''} hover:bg-yellow-300 transition-colors`}
              >
                <div className="font-sans text-sm text-neutral-500 mb-6">/{step.step}</div>
                <h3 className="text-2xl font-black tracking-tight mb-3">{step.title}</h3>
                <p className="text-sm text-neutral-700 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="py-16 px-4 border-b-2 border-black bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="font-sans text-xs uppercase tracking-widest text-neutral-500 block mb-3">
                [ 03 / Why ]
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                Why TaxPri?
              </h2>
            </div>
            <p className="font-sans text-xs uppercase tracking-widest text-neutral-500">
              Built for cross-border pros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'Get analysis in seconds, not days.'
              },
              {
                icon: Shield,
                title: 'Compliance First',
                description: 'Stay compliant with all cross-border regulations.'
              },
              {
                icon: FileText,
                title: 'Document Checklist',
                description: 'Know exactly what documents you need.'
              },
              {
                icon: Globe,
                title: 'Multi-Country',
                description: 'Support for Slovenia, Italy, and more.'
              }
            ].map((benefit, index) => (
              <div
                key={index}
                className="group flex items-start gap-5 p-6 border-2 border-black bg-neutral-50 hover:bg-black hover:text-white transition-colors"
              >
                <div className="w-12 h-12 border-2 border-black bg-yellow-300 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:border-white transition-colors">
                  <benefit.icon className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight mb-1 uppercase">{benefit.title}</h3>
                  <p className="text-sm text-neutral-600 group-hover:text-neutral-300 transition-colors">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-black text-white">
        <div className="max-w-5xl mx-auto">
          <span className="font-sans text-xs uppercase tracking-widest text-yellow-300 block mb-6">
            [ Ready? ]
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 max-w-3xl leading-[0.95]">
            Ready to simplify your cross-border taxes?
          </h2>
          <p className="text-lg text-neutral-400 mb-10 font-sans uppercase tracking-widest text-xs">
            Start your free analysis now
          </p>
          <button
            onClick={() => {
              document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group px-8 py-4 bg-yellow-300 text-black text-lg font-black uppercase tracking-wider flex items-center gap-3 border-2 border-yellow-300 hover:bg-white hover:border-white transition-colors"
          >
            Start Free Analysis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}