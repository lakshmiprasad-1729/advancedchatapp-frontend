import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, SunMoon } from "lucide-react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import ApiRequests from "@/axios/axios";
import { useNavigate } from "react-router-dom";
import { authLogin } from "@/Store/authentication";
import { useAppDispatch, useAppSelector } from "@/Store/hooks";
import { toggleMode } from "@/Store/authentication.ts";

export default function LoginPage() {
  const [phoneno, setPhoneno] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const { width, height } = useWindowSize();
  const dispatch = useAppDispatch();

const darkMode = !useAppSelector(state=>state.auth.darkMode);

  const navigate = useNavigate();

  const handleLogin = async() => {
    if( phoneno.trim() == '' || password.trim()==""){
      console.log(" invalid password and phoneno");
      return;
    }

    const loginUser = await ApiRequests.login({phoneno,password});

  
    if(loginUser?.data?.statuscode == 200){
       dispatch(authLogin(loginUser.data.data));
       navigate('/');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-all duration-300 relative overflow-hidden ${darkMode ? 'bg-[#0f0c29]' : 'bg-white'}`}>
      {showConfetti && <Confetti width={width} height={height} recycle={false} />}

      {/* Aurora animation background */}
      <div className="pointer-events-none absolute inset-0 z-0 animate-aurora bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-700/30 via-fuchsia-600/20 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{ rotateX: 3, rotateY: 3 }}
        className="relative backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10 transform-gpu transition-transform"
      >
        {/* Dark Mode Toggle */}
        <button
          onClick={() => dispatch(toggleMode())}
          className="absolute top-4 right-4 text-white hover:text-purple-400 transition-colors"
        >
          <motion.div whileHover={{ rotate: 90 }}>
            <SunMoon size={20} />
          </motion.div>
        </button>

        <Card className="bg-transparent">
          <CardContent className="p-8">
            {/* Branding */}
            <div className="flex flex-col items-center mb-6">
              <div className="text-white text-4xl font-extrabold tracking-wide bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent animate-pulse">
                NextAuth 🔒
              </div>
              <p className="text-sm text-gray-400 mt-1 italic">Let AI protect your vibe 😎</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-5"
            >
              <div className="relative">
                <Input
                  type="number"
                  value={phoneno}
                  onChange={(e) => setPhoneno(e.target.value)}
                  className="bg-white/10 text-white focus-visible:ring-2 focus-visible:ring-purple-600 transition-all"
                  placeholder="phone number"
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  min={8}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 text-white pr-10 focus-visible:ring-2 focus-visible:ring-purple-600 transition-all"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="accent-purple-600"
                  />
                  Remember me
                </label>
                <button className="hover:underline hover:text-white">Forgot password?</button>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-base py-6 rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 animate-glow"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
