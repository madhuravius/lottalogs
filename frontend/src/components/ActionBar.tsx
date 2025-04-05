import LogoFull from "../assets/logo-full.png";

const ActionBar = () => {
    return (
        <div className="flex items-center p-4 bg-base-200">
            <div className="flex-shrink-0">
                <img src={LogoFull} alt="Logo" className="h-12 w-12 m-2" />
                <p className="text-xs text-gray-500 text-center">Lotta Logs</p>
            </div>
            <input
                type="text"
                placeholder="Search logs..."
                className="input input-bordered w-full ml-4"
            />
        </div>
    );
};

export default ActionBar;
