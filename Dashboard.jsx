import Chat from "../Components/Chat"; 

function Dashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
            <Chat /> {/* Add Chat for user */}
        </div>
    );
}

export default Dashboard;
