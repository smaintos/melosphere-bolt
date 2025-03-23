'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconBug, IconBulb, IconMail, IconCheck, IconSend, IconArrowLeft, IconUsers, IconAlertCircle } from "@tabler/icons-react";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { sendFeedback } from "@/lib/api";

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState('bug');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Désactiver le défilement sur la page
  useEffect(() => {
    // Sauvegarder le style original
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Désactiver le défilement
    document.body.style.overflow = 'hidden';
    
    // Réactiver le défilement lors du démontage du composant
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Envoyer le feedback au backend
      await sendFeedback(email, feedbackType, message);
      
      setSuccess(true);
      setEmail('');
      setMessage('');
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
      setError(error.message || "Une erreur est survenue lors de l'envoi du feedback.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-800/20 via-zinc-900 to-black">
      {/* Éléments décoratifs animés */}
      <div className="fixed inset-0 -z-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-violet-400/30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * -100],
              x: [0, Math.random() * 20 - 10],
              opacity: [0, 0.7, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      
      {/* Bouton retour */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/">
          <Button 
            variant="outline" 
            className="bg-zinc-900/70 backdrop-blur-sm hover:bg-zinc-800 border border-violet-500/30 text-white"
          >
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mx-auto px-4 py-4 md:py-0 z-10"
      >
        <Card className="p-4 md:p-8 backdrop-blur-sm bg-zinc-900/80 border border-violet-500/30 shadow-xl shadow-violet-900/20 rounded-xl max-h-[calc(100vh-30px)] md:max-h-[calc(100vh-40px)] overflow-y-auto md:overflow-visible">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 md:mb-3 bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
              Votre avis nous intéresse
            </h1>
            
            <div className="flex items-center justify-center mb-2">
              <div className="h-px w-10 md:w-12 bg-violet-500/30"></div>
              <IconUsers className="h-4 w-4 md:h-5 md:w-5 mx-2 text-violet-400" />
              <div className="h-px w-10 md:w-12 bg-violet-500/30"></div>
            </div>
            
            <p className="text-zinc-300 text-center text-sm md:text-base mb-1 md:mb-2">
              Melosphere est un projet communautaire
            </p>
            
            <p className="text-zinc-400 text-xs md:text-sm text-center mb-4 md:mb-6">
              Chaque retour est précieux pour façonner ensemble la plateforme idéale pour tous les passionnés de musique. 
              Ce n&apos;est pas seulement notre projet, c&apos;est le <span className="text-violet-400 font-medium">vôtre</span>.
            </p>
          </motion.div>
          
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="py-8 md:py-12 flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-violet-500/20 flex items-center justify-center mb-2">
                  <IconCheck size={28} className="text-violet-400" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-violet-400">Merci pour votre retour !</h2>
                <p className="text-zinc-400 text-center text-sm md:text-base max-w-xs">
                  Nous avons bien reçu votre message et nous vous répondrons dans les meilleurs délais.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-220px)] overflow-y-auto overflow-x-hidden"
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 md:mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-md"
                  >
                    <p className="text-red-400 flex items-center text-xs md:text-sm">
                      <IconAlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      {error}
                    </p>
                  </motion.div>
                )}

                <div className="relative z-10 flex justify-center flex-wrap md:flex-nowrap gap-2 mb-4 md:mb-5 py-1 md:py-2">
                  {[
                    { id: 'bug', label: 'Bug', icon: <IconBug className={`h-3.5 w-3.5 ${feedbackType === 'bug' ? 'text-white' : 'text-red-400'}`} />, color: 'from-red-500 to-pink-600', bgActive: 'bg-gradient-to-r from-red-500 to-pink-600', bgHover: 'bg-red-900/30' },
                    { id: 'feature', label: 'Idée', icon: <IconBulb className={`h-3.5 w-3.5 ${feedbackType === 'feature' ? 'text-white' : 'text-yellow-400'}`} />, color: 'from-yellow-500 to-amber-600', bgActive: 'bg-gradient-to-r from-yellow-500 to-amber-600', bgHover: 'bg-yellow-900/30' },
                    { id: 'contact', label: 'Contact', icon: <IconMail className={`h-3.5 w-3.5 ${feedbackType === 'contact' ? 'text-white' : 'text-blue-400'}`} />, color: 'from-blue-500 to-indigo-600', bgActive: 'bg-gradient-to-r from-blue-500 to-indigo-600', bgHover: 'bg-blue-900/30' }
                  ].map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1"
                    >
                      <Button 
                        variant={feedbackType === item.id ? 'default' : 'outline'}
                        onClick={() => setFeedbackType(item.id)}
                        className={`w-full flex flex-row items-center justify-center gap-1.5 relative px-2 py-1 h-8 rounded-lg border ${
                          feedbackType === item.id 
                            ? `${item.bgActive} border-transparent shadow-lg shadow-${item.id === 'bug' ? 'red' : item.id === 'feature' ? 'yellow' : 'blue'}-600/20` 
                            : `bg-zinc-800/50 border-${item.id === 'bug' ? 'red' : item.id === 'feature' ? 'yellow' : 'blue'}-500/30 hover:${item.bgHover}`
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          feedbackType === item.id
                            ? 'bg-white/20'
                            : `bg-gradient-to-r ${item.color} bg-opacity-30`
                        }`}>
                          {feedbackType === item.id 
                            ? <div className="text-white">{item.icon}</div> 
                            : item.icon
                          }
                        </div>
                        <span className={`text-xs font-medium ${feedbackType === item.id ? 'text-white' : `bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}`}>
                          {item.label}
                        </span>
                        {feedbackType === item.id && (
                          <motion.div
                            layoutId="activeTab"
                            className={`absolute inset-0 rounded-lg -z-10 ${item.bgActive}`}
                          />
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-4 md:space-y-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="p-1"
                  >
                    <label className="block text-sm font-medium mb-2 text-zinc-200">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="w-full bg-zinc-800/50 border-zinc-700 outline-none focus:outline-offset-0 focus:outline-violet-500 focus:border-violet-500 focus:outline-2 h-11 text-base"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="p-1"
                  >
                    <label className="block text-sm font-medium mb-2 text-zinc-200">Message</label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Partagez votre message ici..."
                      required
                      className="w-full h-28 bg-zinc-800/50 border-zinc-700 outline-none focus:outline-offset-0 focus:outline-violet-500 focus:border-violet-500 focus:outline-2 resize-none text-base"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="pt-2"
                  >
                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-violet-600 hover:bg-violet-700 flex items-center justify-center gap-2 py-2 h-12 text-base ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? 'Envoi en cours...' : (
                        <>
                          <IconSend className="h-5 w-5" />
                          Envoyer
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}