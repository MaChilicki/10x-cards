import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_CONSTANTS } from "@/constants/app";

interface AuthCardProps {
  title: string;
  description: React.ReactNode;
  children: React.ReactElement;
  footer?: React.ReactElement;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Card className="cursor-default">
      <CardHeader className="flex flex-col items-center">
        <img src="/logo.svg" alt={`${APP_CONSTANTS.name} Logo`} className="w-24 h-24 mb-4" />
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter className="flex justify-center">{footer}</CardFooter>}
    </Card>
  );
}
