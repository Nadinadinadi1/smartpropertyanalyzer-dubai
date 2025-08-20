import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Send, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FeedbackButtonProps {
  variant?: 'default' | 'compact';
}

export default function FeedbackButton({ variant = 'default' }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Thank you for your feedback! We\'ll review it soon.');
      setIsOpen(false);
      setRating(0);
      setFeedback('');
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  if (variant === 'compact') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full shadow-lg hover:shadow-xl transition-all bg-accent border-accent text-white hover:bg-accent-light w-10 h-10 p-0"
            data-feedback-trigger
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Beta Feedback
            </DialogTitle>
            <DialogDescription>
              Help us improve Smart Property Analyzer Dubai. Your feedback is valuable!
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Rate your experience</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={cn(
                      "p-1 transition-colors",
                      star <= rating ? "text-accent" : "text-muted-foreground hover:text-accent"
                    )}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="feedback">Your feedback *</Label>
              <Textarea
                id="feedback"
                placeholder="What features would you like to see? Any bugs or suggestions?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-2 min-h-[100px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave your email if you'd like us to follow up
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn-premium"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-24 right-4 z-50 rounded-full shadow-lg hover:shadow-xl transition-all btn-premium"
            data-feedback-trigger
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Beta Feedback
          </Button>
        </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Beta Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve Smart Property Analyser Dubai. Your feedback is valuable!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Rate your experience</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={cn(
                    "p-1 transition-colors",
                    star <= rating ? "text-accent" : "text-muted-foreground hover:text-accent"
                  )}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="feedback">Your feedback *</Label>
            <Textarea
              id="feedback"
              placeholder="What features would you like to see? Any bugs or suggestions?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-2 min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave your email if you'd like us to follow up
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-premium"
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                    Send Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}