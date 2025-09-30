import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForRooms from "./TableForRooms";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Room, Location, Floor } from "./roomType";

// -------------------- Sample Locations & Floors --------------------
const sampleLocations: Location[] = [
  { id: 1, name: "Building A" },
  { id: 2, name: "Building B" },
  { id: 3, name: "Building C" },
];

const sampleFloorsByLocation: Record<number, Floor[]> = {
  1: [
    { id: 1, name: "Ground Floor" },
    { id: 2, name: "1st Floor" },
    { id: 3, name: "2nd Floor" },
  ],
  2: [
    { id: 4, name: "1st Floor" },
    { id: 5, name: "2nd Floor" },
    { id: 6, name: "Basement" },
  ],
  3: [
    { id: 7, name: "Ground Floor" },
    { id: 8, name: "3rd Floor" },
  ],
};

// -------------------- Sample Data Generator --------------------
const generateSampleRooms = (): Room[] => {
  const rooms: Room[] = [];
  let counter = 1;

  for (const location of sampleLocations) {
    const floors = sampleFloorsByLocation[location.id] || [];
    for (const floor of floors) {
      // generate 3 rooms per floor
      for (let i = 1; i <= 3; i++) {
        rooms.push({
          id: counter,
          name: `Room ${counter}`,
          location: location.name,
          floor: floor.name,
        });
        counter++;
      }
    }
  }
  return rooms;
};

const sampleRooms = generateSampleRooms();

// -------------------- Column Config --------------------
const columnConfig = [
  { key: "name", label: "Room Name", visible: true, width: "240px" },
  { key: "location", label: "Location", visible: true, width: "160px" },
  { key: "floor", label: "Floor", visible: true, width: "180px" },
];


// ---------------- Main Component ----------------
export default function Rooms() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Room[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // ---------------- Fetch Rooms ----------------
  const fetchRooms = useCallback(
    async (pageNumber = page, pageSize = rowsPerPage, search = searchQuery) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = { page: pageNumber, limit: pageSize, search: search || undefined };
        const { data, error: apiError } = await apiService.post<{
          rooms: Room[];
          total: number;
          page: number;
          totalPages: number;
        }>("/rooms/paginated", payload);

        if (data) {
          setFilteredData(data.rooms);
          setTotalRecords(data.total);
        } else if (apiError) {
          let filtered = [...sampleRooms];
          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter(
              (r) =>
                r.name.toLowerCase().includes(lower) ||
                r.location.toLowerCase().includes(lower) ||
                r.floor.toLowerCase().includes(lower)
            );
          }
          const startIndex = (pageNumber - 1) * pageSize;
          setFilteredData(filtered.slice(startIndex, startIndex + pageSize));
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch rooms");
        const startIndex = (pageNumber - 1) * pageSize;
        setFilteredData(sampleRooms.slice(startIndex, startIndex + pageSize));
        setTotalRecords(sampleRooms.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage, searchQuery]
  );

  useEffect(() => {
    fetchRooms(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchRooms]);

  // ---------------- Debounced Search ----------------
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchRooms(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchRooms]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // ---------------- Delete Handlers ----------------
  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;
    setIsDeleting(true);

    setFilteredData((prev) => prev.filter((r) => r.id !== roomToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Room deleted successfully", "success");

    try {
      const { error } = await apiService.delete(`/rooms/${roomToDelete.id}`);

      if (error) {
        console.error("Failed to delete room:", error);
        // showToast("Failed to delete room", "error");
        // fetchRooms(page, rowsPerPage, searchQuery);
      } else {

        setFilteredData((prev) => prev.filter((r) => r.id !== roomToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Room deleted successfully", "success");

        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchRooms(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchRooms(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting room:", err);
      // showToast("Error deleting room", "error");
      // fetchRooms(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setRoomToDelete(null);
      setIsDeleting(false);
    }
  };



  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setRoomToDelete(null);
  };

  // ---------------- Navigation ----------------
  const handleNavigateToAddEdit = (room?: Room) => {
    navigate("/add-edit-room", { state: { room: room || null, isEditing: !!room } });
  };

  const handleEdit = (room: Room) => {
    handleNavigateToAddEdit(room);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchRooms(1, 10, "");
    showToast("Data refreshed", "info");
  };

  // ---------------- Derived Values ----------------
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const firstItem = totalRecords === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + rowsPerPage, totalRecords);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta title="Rooms | Admin Portal" description="Manage rooms with pagination and search" />

      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Rooms"
          btnLabel="Add New"
          onSearch={handleSearch}
          onNavigate={() => handleNavigateToAddEdit()}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <TableForRooms
            data={filteredData}
            columns={columnConfig}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            firstItem={firstItem}
            lastItem={lastItem}
            totalFiltered={totalRecords}
            totalRecords={totalRecords}
            totalPages={totalPages}
            showSrNo={true}
            showActions={true}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            isLoading={false}
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Room"
        message={
          roomToDelete ? (
            <span>
              Are you sure you want to delete <strong>{roomToDelete.name}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this room?"
          )
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="warning"
        isLoading={isDeleting}
      />

      <CentralizedLoader isLoading={isDeleting || isLoading} message="Processing your request..." />
    </div>
  );
}
