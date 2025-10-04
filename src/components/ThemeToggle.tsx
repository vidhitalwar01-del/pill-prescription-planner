import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        loadTheme(user.id);
      } else {
        // Load from localStorage if not logged in
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" || "dark";
        setTheme(savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
      }
    });
  }, []);

  const loadTheme = async (uid: string) => {
    const { data } = await supabase
      .from("user_settings")
      .select("theme")
      .eq("user_id", uid)
      .single();

    if (data?.theme) {
      setTheme(data.theme as "light" | "dark");
      document.documentElement.classList.toggle("dark", data.theme === "dark");
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    if (userId) {
      // Save to database
      const { error } = await supabase
        .from("user_settings")
        .upsert({ user_id: userId, theme: newTheme }, { onConflict: "user_id" });

      if (error) console.error("Error saving theme:", error);
    } else {
      // Save to localStorage
      localStorage.setItem("theme", newTheme);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-glow"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
