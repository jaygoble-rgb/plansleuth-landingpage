import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import HowItWorks from "@/pages/how-it-works";
import About from "@/pages/about";
import Medicare from "@/pages/medicare";
import Cellular from "@/pages/cellular";
import Internet from "@/pages/internet";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Contact from "@/pages/contact";
import BlogIndex from "@/pages/blog/index";
import BlogPost from "@/pages/blog/post";
import BlogAdminLogin from "@/pages/blogadmin/login";
import BlogAdminDashboard from "@/pages/blogadmin/dashboard";
import BlogAdminEditor from "@/pages/blogadmin/editor";
import BlogAdminWaitlist from "@/pages/blogadmin/waitlist";

const queryClient = new QueryClient();

export function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/about" component={About} />
      <Route path="/medicare" component={Medicare} />
      <Route path="/cellular" component={Cellular} />
      <Route path="/internet" component={Internet} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/contact" component={Contact} />
      <Route path="/blog" component={BlogIndex} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/blogadmin/login" component={BlogAdminLogin} />
      <Route path="/blogadmin/new" component={BlogAdminEditor} />
      <Route path="/blogadmin/edit/:id" component={BlogAdminEditor} />
      <Route path="/blogadmin/waitlist" component={BlogAdminWaitlist} />
      <Route path="/blogadmin" component={BlogAdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
