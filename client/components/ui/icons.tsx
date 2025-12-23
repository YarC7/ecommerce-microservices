"use client";

import { LucideIcon, Home, User, ShoppingCart, Settings } from "lucide-react";
import React from "react";

export const Icons = {
  Home: (props: React.SVGProps<SVGSVGElement>) => <Home {...props} />,
  User: (props: React.SVGProps<SVGSVGElement>) => <User {...props} />,
  Cart: (props: React.SVGProps<SVGSVGElement>) => <ShoppingCart {...props} />,
  Settings: (props: React.SVGProps<SVGSVGElement>) => <Settings {...props} />,
};

export default Icons;
