import { GithubIcon } from "lucide-react";
import { Button } from "./ui/button";

export const Footer = () => {
  return (
    <footer className="flex items-center justify-center mb-8">
      <a
        href="https://github.com/danish17/csv-deduper"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline">
          View on GitHub <GithubIcon />
        </Button>
      </a>
    </footer>
  );
};
