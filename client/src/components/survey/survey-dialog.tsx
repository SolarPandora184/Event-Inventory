import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { database } from "@/lib/firebase";
import { ref, push, set } from "firebase/database";
import { ClipboardList } from "lucide-react";

const surveySchema = z.object({
  userType: z.string().min(1, "Please select your user type"),
  wouldUseAgain: z.string().min(1, "Please answer this question"),
  preferOverExcel: z.string().min(1, "Please answer this question"),
  feedback: z.string().optional(),
});

type SurveyFormData = z.infer<typeof surveySchema>;

interface SurveyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SurveyDialog({ isOpen, onClose }: SurveyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      userType: "",
      wouldUseAgain: "",
      preferOverExcel: "",
      feedback: "",
    },
  });

  const onSubmit = async (data: SurveyFormData) => {
    setIsSubmitting(true);
    
    try {
      const surveyData = {
        ...data,
        timestamp: Date.now(),
      };

      const surveyRef = push(ref(database, "surveys"));
      await set(surveyRef, surveyData);

      toast({
        title: "Survey Submitted",
        description: "Thank you for your feedback! Your response has been recorded.",
      });

      form.reset();
      onClose();
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="survey-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-text-primary flex items-center">
            <ClipboardList className="mr-2 h-5 w-5" />
            Quick Survey
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Help us improve the system with your feedback
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="userType" className="text-sm font-medium text-text-primary">
              User Type
            </Label>
            <Select
              onValueChange={(value) => form.setValue("userType", value)}
              data-testid="select-user-type"
            >
              <SelectTrigger className="mt-2 bg-input border-border text-text-primary">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event-senior-staff">Event Senior Staff</SelectItem>
                <SelectItem value="event-participant">Event Participant</SelectItem>
                <SelectItem value="requestor-only">Requestor Only</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.userType && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.userType.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="wouldUseAgain" className="text-sm font-medium text-text-primary">
              Would you use this system again?
            </Label>
            <Select
              onValueChange={(value) => form.setValue("wouldUseAgain", value)}
              data-testid="select-use-again"
            >
              <SelectTrigger className="mt-2 bg-input border-border text-text-primary">
                <SelectValue placeholder="Select your answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="maybe">Maybe</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.wouldUseAgain && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.wouldUseAgain.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="preferOverExcel" className="text-sm font-medium text-text-primary">
              Would you prefer a system like this over an Excel spreadsheet?
            </Label>
            <Select
              onValueChange={(value) => form.setValue("preferOverExcel", value)}
              data-testid="select-prefer-over-excel"
            >
              <SelectTrigger className="mt-2 bg-input border-border text-text-primary">
                <SelectValue placeholder="Select your answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="depends">Depends on the situation</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.preferOverExcel && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.preferOverExcel.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="feedback" className="text-sm font-medium text-text-primary">
              Any glitches encountered during event or any system improvement ideas
            </Label>
            <Textarea
              id="feedback"
              {...form.register("feedback")}
              data-testid="textarea-feedback"
              className="mt-2 bg-input border-border text-text-primary placeholder:text-text-muted resize-none"
              placeholder="Share any issues you encountered or suggestions for improvement..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-survey"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="button-submit-survey"
              className="bg-aesa-blue hover:bg-aesa-accent text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}