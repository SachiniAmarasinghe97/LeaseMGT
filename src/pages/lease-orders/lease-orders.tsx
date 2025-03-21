import { useEffect, useState, useCallback } from "react";
import "./lease-orders.scss";
import { Button, Modal, Form, Alert, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faCubes, faTrash, faUpload, faDownload } from "@fortawesome/free-solid-svg-icons";
import { useServiceProvider } from "../../providers/service-provider";
import LoaderSmall from "../../components/loader-small";
import ToastMessage from "../../utils/toast-message";
import DateTimeHelper from "../../helpers/date-time-helper";
import UtilHelper from "../../utils/util-helper";

const metadataLinkPrefix: string = `${process.env.REACT_APP_API_URL}/lease-order-metadata` || "";

export default function LeaseOrders() {
  const [loading, setLoading] = useState(false);
  const [orderListLoading, setOrderListLoading] = useState(true);
  const [leaseOrderList, setLeaseOrderList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [newLeaseOrder, setNewLeaseOrder] = useState<{ reference: string; title: string; description: string; createdAt: string; selectedLeases: string[] }>({
    reference: "",
    title: "",
    description: "",
    createdAt: "",
    selectedLeases: [],
  });
  const [leases, setLeases] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const itemsPerPage = 10;
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const { leaseService, xrplService } = useServiceProvider();

  const loadDataAsync = useCallback(async () => {
    try {
      setOrderListLoading(true);
      const leaseOrderList = await leaseService.getLeaseOrdersAsync();
      setLeaseOrderList(leaseOrderList ?? []);
    } catch (e: any) {
      ToastMessage.show("Failed to fetch lease orders. Please try again.", "error");
    } finally {
      setOrderListLoading(false);
    }
  }, [leaseService]);

  const loadLeasesAsync = useCallback(async () => {
    try {
      const leases = await leaseService.getLeasesAsync();
      setLeases(leases);
    } catch (error) {
      ToastMessage.show("Failed to fetch leases. Please try again.", "error");
    }
  }, [leaseService]);

  useEffect(() => {
    const loadData = async () => {
      await loadDataAsync();
      await loadLeasesAsync();
    };
    loadData();
  }, [loadDataAsync, loadLeasesAsync]);

  const handleDeleteLeaseOrder = useCallback(
    async (reference: string) => {
      if (loading) return;
      setLoading(true);
      try {
        const res = await leaseService.deleteLeaseOrderAsync(reference);
        if (res) {
          if (res.nftId) {
            await xrplService.burnNFT(res.nftId);
          }
          setLeaseOrderList(leaseOrderList.filter((order) => order.reference !== res.reference));
        } else {
          ToastMessage.show("Failed to delete lease order. Please try again.", "error");
        }
      } catch (e: any) {
        console.log(e);
        ToastMessage.show("Failed to delete lease order. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    },
    [leaseOrderList, loading, leaseService, xrplService]
  );

  const handleCreateLeaseOrder = useCallback(async () => {
    if (loading) return;

    if (!newLeaseOrder.selectedLeases.length) {
      setWarningMessage("Please select at least one lease");
      return;
    }

    setLoading(true);

    const payload = {
      reference: newLeaseOrder.reference ?? 0,
      title: newLeaseOrder.title,
      description: newLeaseOrder.description,
      leases: newLeaseOrder.selectedLeases,
    };

    try {
      const response = await leaseService.createLeaseOrderAsync(payload);
      if (response) {
        const res = await xrplService.mintNFT(Buffer.from(`${metadataLinkPrefix}/${response.reference}`).toString("hex").toUpperCase());
        const nftId = res?.result?.meta?.nftoken_id;
        if (nftId) {
          const updated = await leaseService.updateLeaseOrderNftAsync(response.reference, nftId);
          if (updated) {
            setLeaseOrderList([updated, ...leaseOrderList]);
            setNewLeaseOrder({ reference: "", title: "", description: "", createdAt: "", selectedLeases: [] });
            setShowLeaseModal(false);
          } else {
            setLeaseOrderList([response, ...leaseOrderList]);
            setWarningMessage("Failed to create lease order. Please try again.");
          }
        } else {
          setLeaseOrderList([response, ...leaseOrderList]);
          setWarningMessage("Failed to mint NFT. Please try again.");
        }
      } else {
        setWarningMessage("Failed to save export order. Please try again.");
      }
    } catch (error) {
      console.log(error);
      setWarningMessage("Failed to save export order. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loading, leaseOrderList, leaseService, xrplService, newLeaseOrder]);

  const handleViewLeaseOrder = async (order: { reference: string }) => {
    const orderDetails = await leaseService.getLeaseOrderAsync(order.reference);
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

  const isFormValid = newLeaseOrder.title && newLeaseOrder.description;

  const resetForm = () => {
    setNewLeaseOrder({ reference: "", title: "", description: "", createdAt: "", selectedLeases: [] });
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

  const handleLeaseChange = (reference: string) => {
    setNewLeaseOrder((prevState) => ({
      ...prevState,
      selectedLeases: prevState.selectedLeases.includes(reference) ? prevState.selectedLeases.filter((r) => r !== reference) : [...prevState.selectedLeases, reference],
    }));
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      try {
        setLoading(true);
        const file = event.target.files[0];
        const res = await leaseService.uploadLeaseFileAsync(file);
        if (res) {
          await loadLeasesAsync();
          await loadDataAsync();
          ToastMessage.show("Leases uploaded successfully", "success");
        } else {
          ToastMessage.show("Failed to upload leases", "error");
        }
      } catch (error) {
        console.error("Error uploading leases:", error);
        ToastMessage.show("Failed to upload leases","error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await leaseService.downloadLeasesAsync();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "leases.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      ToastMessage.show("Leases downloaded successfully", "success");
    } catch (error) {
      console.error("Error downloading leases:", error);
      ToastMessage.show("Failed to download leases", "error");
    }
  };

  return (
    <div className="lease-orders-page">
      <div className="row">
        <div className="col">
          <h1>Lease Policies</h1>
        </div>
        <div className="col">
          <div className="text-end">
            <input type="file" id="upload-button" style={{ display: "none" }} onChange={handleUpload} />
            <label htmlFor="upload-button" className="btn">
              <FontAwesomeIcon icon={faUpload} />
            </label>
            <label className="btn" onClick={handleDownload}>
              <FontAwesomeIcon icon={faDownload} />
            </label>
          </div>
        </div>
      </div>
      <Button
        className="add-button"
        onClick={() => {
          resetForm();
          setSelectedOrder(null);
          setShowModal(true);
        }}
      >
        Create New Lease Policy
      </Button>
      <div className="table-container">
        {orderListLoading ? (
          <LoaderSmall style={{ height: "50vh" }} />
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th className="title-header-name">Title</th>
                  <th className="description-header-name">Description</th>
                  <th className="action-header-name">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3}>
                      <LoaderSmall />
                    </td>
                  </tr>
                ) : (
                  <>
                    {paginatedLeaseOrders.length === 0 ? (
                      <tr>
                        <td colSpan={3}>No lease orders added</td>
                      </tr>
                    ) : (
                      paginatedLeaseOrders.map((order, index) => (
                        <tr key={index}>
                          <td>{order.title}</td>
                          <td>{order.description}</td>
                          {/* <td>
                          {(order.leases ?? []).map((lease: any, index: number) => (
                            <Badge key={index} bg="success" className="lease-badge">
                              {lease?.title}
                            </Badge>
                          ))}
                        </td> */}
                          <td>
                            <Button className="action-button" data-title="View Lease Order" onClick={() => handleViewLeaseOrder(order)}>
                              <FontAwesomeIcon icon={faEye} />
                            </Button>
                            {order.nftId && (
                              <Button className="action-button" data-title="View Lease Order NFT" onClick={() => window.open(UtilHelper.getNftLink(order.nftId), "_blank")}>
                                <FontAwesomeIcon icon={faCubes} />
                              </Button>
                            )}
                            <Button className="action-button" data-title="Delete Lease Order" onClick={() => handleDeleteLeaseOrder(order.reference)}>
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </>
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
                <strong>Reference:</strong> {selectedOrder.reference}
              </p>
              <p>
                <strong>Title:</strong> {selectedOrder.title}
              </p>
              <p>
                <strong>Description:</strong> {selectedOrder.description}
              </p>
              <p>
                <strong>Created On:</strong> {DateTimeHelper.convertToLocalDateTimeString(new Date(selectedOrder.createdAt))}
              </p>
              <p>
                <strong>Leases:</strong>{" "}
                {(selectedOrder.leases ?? []).map((lease: any, index: number) => {
                  const leaseObj = leases.find((l) => l.reference === lease);
                  return (
                    <Badge key={index} bg="success" className="lease-badge">
                      {leaseObj?.title && leaseObj.description ? `${leaseObj?.title} (${leaseObj?.description})` : `${leaseObj?.reference.slice(0, 10)}...`}
                    </Badge>
                  );
                })}
              </p>
              {selectedOrder.nftId && (
                <p>
                  <strong>NFT:</strong>{" "}
                  <a href={UtilHelper.getNftLink(selectedOrder.nftId)} target="_blank" rel="noreferrer">
                    {selectedOrder.nftId.slice(0, 40)}...
                  </a>
                </p>
              )}
            </div>
          ) : (
            <Form>
              {warningMessage && <Alert variant="danger">{warningMessage}</Alert>}
              <Form.Group controlId="formLeaseOrderName" className="form-group">
                <Form.Label className="required">Title</Form.Label>
                <Form.Control type="text" placeholder="Enter lease order name" value={newLeaseOrder.title} onChange={(e) => setNewLeaseOrder({ ...newLeaseOrder, title: e.target.value })} required />
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
                key={lease.reference}
                type="checkbox"
                label={lease?.title && lease.description ? `${lease?.title} (${lease?.description})` : `${lease?.reference.slice(0, 10)}...`}
                value={lease.reference}
                checked={newLeaseOrder.selectedLeases.includes(lease.reference)}
                onChange={() => handleLeaseChange(lease.reference)}
              />
            ))}
          </Form.Group>
          {loading && <LoaderSmall style={{ height: "10vh" }} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCreateLeaseOrder} disabled={!!newLeaseOrder.reference}>
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
