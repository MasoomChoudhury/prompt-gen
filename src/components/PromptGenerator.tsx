import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Send, Sparkles, Bot, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PromptGenerator = () => {
  const [userInput, setUserInput] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const systemPrompt = `Given a task description or existing prompt, produce a detailed system prompt to guide a language model in completing the task effectively.

# Guidelines

- Understand the Task: Grasp the main objective, goals, requirements, constraints, and expected output.
- Minimal Changes: If an existing prompt is provided, improve it only if it's simple. For complex prompts, enhance clarity and add missing elements without altering the original structure.
- Reasoning Before Conclusions: Encourage reasoning steps before any conclusions are reached. ATTENTION! If the user provides examples where the reasoning happens afterward, REVERSE the order! NEVER START EXAMPLES WITH CONCLUSIONS!
    - Reasoning Order: Call out reasoning portions of the prompt and conclusion parts (specific fields by name). For each, determine the ORDER in which this is done, and whether it needs to be reversed.
    - Conclusion, classifications, or results should ALWAYS appear last.
- Examples: Include high-quality examples if helpful, using placeholders [in brackets] for complex elements.
   - What kinds of examples may need to be included, how many, and whether they are complex enough to benefit from placeholders.
- Clarity and Conciseness: Use clear, specific language. Avoid unnecessary instructions or bland statements.
- Formatting: Use markdown features for readability. DO NOT USE \`\`\` CODE BLOCKS UNLESS SPECIFICALLY REQUESTED.
- Preserve User Content: If the input task or prompt includes extensive guidelines or examples, preserve them entirely, or as closely as possible. If they are vague, consider breaking down into sub-steps. Keep any details, guidelines, examples, variables, or placeholders provided by the user.
- Constants: DO include constants in the prompt, as they are not susceptible to prompt injection. Such as guides, rubrics, and examples.
- Output Format: Explicitly the most appropriate output format, in detail. This should include length and syntax (e.g. short sentence, paragraph, JSON, etc.)
    - For tasks outputting well-defined or structured data (classification, JSON, etc.) bias toward outputting a JSON.
    - JSON should never be wrapped in code blocks (\`\`\`) unless explicitly requested.

The final prompt you output should adhere to the following structure below. Do not include any additional commentary, only output the completed system prompt. SPECIFICALLY, do not include any additional messages at the start or end of the prompt. (e.g. no "---")

[Concise instruction describing the task - this should be the first line in the prompt, no section header]

[Additional details as needed.]

[Optional sections with headings or bullet points for detailed steps.]

# Steps [optional]

[optional: a detailed breakdown of the steps necessary to accomplish the task]

# Output Format

[Specifically call out how the output should be formatted, be it response length, structure e.g. JSON, markdown, etc]

# Examples [optional]

[Optional: 1-3 well-defined examples with placeholders if necessary. Clearly mark where examples start and end, and what the input and output are. User placeholders as necessary.]
[If the examples are shorter than what a realistic example is expected to be, make a reference with () explaining how real examples should be longer / shorter / different. AND USE PLACEHOLDERS! ]

# Notes [optional]

[optional: edge cases, details, and an area to call or repeat out specific important considerations]`;

  const enhancePrompt = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Enter a task description or existing prompt to enhance.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nUser input: ${userInput}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate enhanced prompt");
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      setEnhancedPrompt(generatedText);
      
      toast({
        title: "Prompt Enhanced!",
        description: "Your enhanced prompt is ready to use.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enhance prompt. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!enhancedPrompt) return;
    
    try {
      await navigator.clipboard.writeText(enhancedPrompt);
      toast({
        title: "Copied!",
        description: "Enhanced prompt copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the text manually.",
        variant: "destructive",
      });
    }
  };

  const suggestionCards = [
    {
      icon: <Bot className="w-5 h-5" />,
      title: "Code Review Assistant",
      description: "Expert code reviewer",
      prompt: "Create a system that reviews code for best practices, security issues, and optimization opportunities."
    },
    {
      icon: <Wand2 className="w-5 h-5" />,
      title: "Creative Writing Coach",
      description: "Storytelling guidance",
      prompt: "Help writers improve their narrative structure, character development, and dialogue quality."
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Data Analysis Expert",
      description: "Insight extraction",
      prompt: "Analyze datasets to identify trends, patterns, and actionable business insights."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh relative">
      {/* Animated mesh background overlay */}
      <div className="absolute inset-0 bg-gradient-subtle opacity-90" />
      <div className="relative z-10 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-card rounded-2xl shadow-soft mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            PromptGen
          </h1>
          <p className="text-muted-foreground text-lg">
            Transform your ideas into detailed system prompts with AI precision
          </p>
        </div>

        {/* API Key Input */}
        <Card className="p-6 mb-6 bg-gradient-card border-border shadow-card">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Gemini API Key
            </label>
            <Input
              type="password"
              placeholder="Enter your Gemini API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-background border-border focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground">
              Get your free API key from{" "}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>
        </Card>

        {/* Suggestion Cards */}
        {!userInput && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {suggestionCards.map((card, index) => (
              <Card
                key={index}
                className="p-6 bg-gradient-card border-border shadow-card hover:shadow-floating transition-all duration-300 cursor-pointer group"
                onClick={() => setUserInput(card.prompt)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Input Section */}
        <Card className="p-6 mb-6 bg-gradient-card border-border shadow-card">
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground">
              Enter your task description or existing prompt
            </label>
            <Textarea
              placeholder="Describe the task you want to create a system prompt for..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={6}
              className="bg-background border-border focus:ring-primary resize-none"
            />
            <Button
              onClick={enhancePrompt}
              disabled={isLoading || !userInput.trim() || !apiKey.trim()}
              className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium py-6 rounded-xl shadow-soft transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                  Enhancing Prompt...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Enhance Prompt
                </div>
              )}
            </Button>
          </div>
        </Card>

        {/* Output Section */}
        {enhancedPrompt && (
          <Card className="p-6 bg-gradient-card border-border shadow-card">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Enhanced System Prompt
                </label>
                <Button
                  onClick={copyToClipboard}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                  {enhancedPrompt}
                </pre>
              </div>
            </div>
          </Card>
        )}
      </div>
      </div>
      
      {/* Footer */}
      <div className="w-full text-center py-4 mt-8">
        <p className="text-foreground opacity-70 text-lg">
          Made with <span className="text-red-500 mx-1">❤</span> by Masoom Kumar Choudhury
        </p>
      </div>
    </div>
  );
};

export default PromptGenerator;