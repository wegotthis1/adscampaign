import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="py-6 px-4 border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-5 h-5 object-contain opacity-60" />
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold text-foreground">Webcom Media</span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
