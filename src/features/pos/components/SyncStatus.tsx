import Chip from "@mui/material/Chip";
import useNetwork from "../hooks/useNetwork";

export default function SyncStatus() {

    const online = useNetwork();

    return online
        ? <Chip color="success" label="Online" />
        : <Chip color="warning" label="Offline" />;
}