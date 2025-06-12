import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import app from "./firebase";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth(app);

  const signUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Đăng ký thành công");
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
    }
  };

  const signIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Đăng nhập thành công");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
    }
  };

  const continueAsGuest = () => {
    console.log("Tiếp tục với tư cách khách");
    // Logic để chuyển vào ứng dụng với chế độ khách
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Tạo tài khoản hoặc đăng nhập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
            <Input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between space-x-2">
              <Button onClick={signIn} className="w-full" variant="default">
                Đăng nhập
              </Button>
              <Button onClick={signUp} className="w-full" variant="outline">
                Đăng ký
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-center text-sm text-muted-foreground">
          <div>
            Trợ lý AI Đại Nam rất vui được hỗ trợ bạn!
          </div>
          <Button
            onClick={continueAsGuest}
            className="mt-2 transition-transform duration-200 hover:bg-blue-600 hover:scale-105"
            variant="ghost"
            >
            Tiếp tục với tư cách khách
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Auth;