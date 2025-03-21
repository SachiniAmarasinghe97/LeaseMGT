import React, { useEffect, useState, useCallback } from "react";
import "./lease-orders.scss";
import { Button, Modal, Form, Alert, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faCubes } from "@fortawesome/free-solid-svg-icons";
import { useServiceProvider } from "../../providers/service-provider";
import LoaderSmall from "../../components/loader-small";

export default function LeaseOrders() {
  const [loading, setLoading] = useState(false);
  const [orderListLoading, setOrderListLoading] = useState(true);
  const [leaseOrderList, setLeaseOrderList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [newLeaseOrder, setNewLeaseOrder] = useState<{ id: number; name: string; description: string; selectedLeases: string[] }>({ id: 0, name: "", description: "", selectedLeases: [] });
  const [leases, setLeases] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const itemsPerPage = 10;
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const { leaseService } = useServiceProvider();

  const loadDataAsync = useCallback(async () => {
    try {
      setOrderListLoading(true);
      const leaseOrderList = await leaseService.getLeaseOrdersAsync();
      setLeaseOrderList(leaseOrderList ?? []);
      setOrderListLoading(false);
    } finally {
    }
  }, [leaseService]);

  const loadLeasesAsync = useCallback(async () => {
    try {
      const leases = await leaseService.getLeasesAsync();
      setLeases(leases);
    } catch (error) {
      console.error("Failed to load leases", error);
    }
  }, [leaseService]);

  useEffect(() => {
    const loadData = async () => {
      await loadDataAsync();
      await loadLeasesAsync();
    };
    loadData();
  }, [loadDataAsync, loadLeasesAsync]);

  const handleCreateLeaseOrder = async () => {
    if (loading) return;
    setLoading(true);

    const payload = {
      id: newLeaseOrder.id ?? 0,
      name: newLeaseOrder.name,
      description: newLeaseOrder.description,
      leases: newLeaseOrder.selectedLeases.map((leaseId: string | number) => {
        const lease = leases.find((l) => l.id === parseInt(leaseId.toString()));
        return lease ? { ...lease } : { id: 0, name: "", description: "" };
      }),
    };

    try {
      const response = await leaseService.createLeaseOrderAsync(payload);
      if (response) {
        setLeaseOrderList([
          {
            ...newLeaseOrder,
            id: response.id,
            name: newLeaseOrder.name,
            description: newLeaseOrder.description,
            leases: newLeaseOrder.selectedLeases.map((leaseId) => leases.find((lease) => lease.id === parseInt(leaseId))!),
          },
          ...leaseOrderList,
        ]);
        setNewLeaseOrder({ id: 0, name: "", description: "", selectedLeases: [] });
        setShowLeaseModal(false);
      } else {
        setWarningMessage("Failed to save lease order. Please try again.");
      }
    } catch (error) {
      console.log(error);
      setWarningMessage("Failed to save lease order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewLeaseOrder = async (order: { id: any; }) => {
    const orderDetails = await leaseService.getLeaseOrderAsync(order.id);
    setSelectedOrder(orderDetails);
    setShowModal(true);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(leaseOrderList.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const paginatedLeaseOrders = leaseOrderList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isFormValid = newLeaseOrder.name && newLeaseOrder.description;

  const resetForm = () => {
    setNewLeaseOrder({ id: 0, name: "", description: "", selectedLeases: [] });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    resetForm();
  };

  const handleCloseLeaseModal = () => {
    setShowLeaseModal(false);
    resetForm();
  };

  const handleLeaseChange = (leaseId: string) => {
    setNewLeaseOrder((prevState) => ({
      ...prevState,
      selectedLeases: prevState.selectedLeases.includes(leaseId)
        ? prevState.selectedLeases.filter((id) => id !== leaseId)
        : [...prevState.selectedLeases, leaseId],
    }));
  };

  return (
    <div className="lease-orders-page">
      <h1>Lease Policies</h1>
      <Button
        className="add-button"
        onClick={() => {
          resetForm();
          setSelectedOrder(null);
          setShowModal(true);
        }}
      >
        Create New Lease Order
      </Button>
      <div className="table-container">
        {orderListLoading ? (
          <LoaderSmall style={{ height: "50vh" }} />
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th className="title-header-name">Name</th>
                  <th className="description-header-name">Description</th>
                  <th className="action-header-name">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={3}>No lease orders added</td>
                  </tr>
                ) : (
                  paginatedLeaseOrders.map((order, index) => (
                    <tr key={index}>
                      <td>{order.name}</td>
                      <td>{order.description}</td>
                      {/* <td>
                        {(order.leases ?? []).map((lease: any, index: number) => (
                          <Badge key={index} bg="success" className="lease-badge">
                            {lease?.name}
                          </Badge>
                        ))}
                      </td> */}
                      <td>
                        <Button className="eye-button" data-title="View Lease Order" onClick={() => handleViewLeaseOrder(order)}>
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                        {order.nFTokenId && (
                          <Button className="nft-button" data-title="View Lease Order NFT" onClick={() => window.open(order.nFTokenId, "_blank")}>
                            <FontAwesomeIcon icon={faCubes} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {leaseOrderList.length > itemsPerPage && (
              <div className="pagination-container">
                {currentPage > 1 && (
                  <span className="page-number previous" onClick={handlePreviousPage}>
                    Previous
                  </span>
                )}
                {Array.from({ length: Math.ceil(leaseOrderList.length / itemsPerPage) }, (_, index) => (
                  <span key={index + 1} className={`page-number ${index + 1 === currentPage ? "active" : ""}`} onClick={() => handlePageChange(index + 1)}>
                    {index + 1}
                  </span>
                ))}
                <span className="page-number next" onClick={handleNextPage}>
                  Next
                </span>
              </div>
            )}
          </>
        )}
      </div>
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{selectedOrder ? "Lease Order Details" : "Create New Lease Order"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder ? (
            <div>
              <p>
                <strong>Id:</strong> {selectedOrder.id}
              </p>
              <p>
                <strong>Name:</strong> {selectedOrder.name}
              </p>
              <p>
                <strong>Description:</strong> {selectedOrder.description}
              </p>
              <p>
                <strong>Leases:</strong>{" "}
                {(selectedOrder.leases ?? []).map((lease: any, index: number) => (
                  <Badge key={index} bg="success" className="lease-badge">{`${lease?.name} (${lease?.description})`}</Badge>
                ))}
              </p>
              {selectedOrder.nFTokenId && (
                <p>
                  <strong>NFT:</strong>{" "}
                  <a href={selectedOrder.nFTokenId} target="_blank" rel="noreferrer">
                    {selectedOrder.nFTokenId.slice(0, 40)}...
                  </a>
                </p>
              )}
            </div>
          ) : (
            <Form>
              {warningMessage && <Alert variant="danger">{warningMessage}</Alert>}
              <Form.Group controlId="formLeaseOrderName" className="form-group">
                <Form.Label className="required">Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter lease order name"
                  value={newLeaseOrder.name}
                  onChange={(e) => setNewLeaseOrder({ ...newLeaseOrder, name: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formLeaseOrderDescription" className="form-group">
                <Form.Label className="required">Description</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter lease order description"
                  value={newLeaseOrder.description}
                  onChange={(e) => setNewLeaseOrder({ ...newLeaseOrder, description: e.target.value })}
                  required
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedOrder ? (
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  setShowModal(false);
                  setShowLeaseModal(true);
                }}
                disabled={!isFormValid}
              >
                Next
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
      <Modal show={showLeaseModal} onHide={handleCloseLeaseModal} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Select Leases</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formLeaseType">
            <Form.Label className="required">Available Leases</Form.Label>
            {leases.map((lease) => (
              <Form.Check
                key={lease.id}
                type="checkbox"
                label={`${lease.name} (${lease.description})`}
                value={lease.id.toString()}
                checked={newLeaseOrder.selectedLeases.includes(lease.id.toString())}
                onChange={() => handleLeaseChange(lease.id.toString())}
              />
            ))}
          </Form.Group>
          {loading && <LoaderSmall style={{ height: "10vh" }} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCreateLeaseOrder} disabled={newLeaseOrder.id > 0}>
            Create
          </Button>
          <Button variant="secondary" onClick={handleCloseLeaseModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
