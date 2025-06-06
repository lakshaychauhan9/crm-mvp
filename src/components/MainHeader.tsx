import { useUser } from "@clerk/nextjs";

const Header: React.FC = () => {
  const { user } = useUser();
  return (
    <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Client Tracker</h1>
      {user && (
        <span className="text-sm">
          Welcome, {user.firstName || user.username || "User"}
        </span>
      )}
    </header>
  );
};

export default Header;
