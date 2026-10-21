import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { EntityMark } from "@/components/icons/EntityIcon";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex h-screen items-center justify-center overflow-y-auto bg-page p-4">
      <div className="flex flex-col items-center text-center">
        <EntityMark id="not-found" size={72} />
        <p className="type-eyebrow mt-3 text-quaternary">Error 404</p>
        <h1 className="type-display-xl mt-2 text-foreground">Page not found</h1>
        <p className="type-body-md mt-1 text-tertiary">The page you requested does not exist.</p>
        <a href="/" className="type-label-sm mt-4 inline-block text-secondary-foreground underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-active">
          Return to home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
