import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./export-orders.scss";
import { Button, Modal, Form, Alert, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faHistory, faEye, faCubes } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useServiceProvider } from "../../providers/service-provider";
import ExportOrder from "../../models/export-order";
import Batch from "../../models/batch";
import LoaderSmall from "../../components/loader/loader-small";
import { ExportOrderStatuses } from "../../common/constants";
import UtilHelper from "../../utils/util-helper";

export default function ExportOrders() {
  const [loading, setLoading] = useState(false);
  const [orderListLoading, setOrderListLoading] = useState(true);
  const [exportOrderList, setExportOrderList] = useState<ExportOrder[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [newExportOrder, setNewExportOrder] = useState<{ id: number; reference: string; title: string; description: string; date: Date; nFTokenId: string }>({
    id: 0,
    reference: "",
    title: "",
    description: "",
    date: new Date(),
    nFTokenId: "",
  });
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<ExportOrder | null>(null);
  const itemsPerPage = 10;
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const { web3ServiceFactory, exportOrderService, batchService } = useServiceProvider();

  const loadDataAsync = useCallback(async () => {
    try {
      if (exportOrderService) {
        setOrderListLoading(true);
        const exportOrderList = await exportOrderService.getExportOrdersAsync();
        setExportOrderList(exportOrderList ?? []);
        setOrderListLoading(false);
      }
    } finally {
    }
  }, [exportOrderService]);

  const loadBatchesAsync = useCallback(async () => {
    try {
      const batches = await batchService.getBatchesAsync();
      setBatches(batches.filter((b, i) => b.description && i === batches.findIndex((b2) => b2.productId === b.productId && b2.description === b.description)));
    } catch (error) {
      console.error("Failed to load batches", error);
    }
  }, [batchService]);

  useEffect(() => {
    const loadData = async () => {
      await loadDataAsync();
      await loadBatchesAsync();
    };
    loadData();
  }, [loadDataAsync, loadBatchesAsync]);

  const handleCreateExportOrder = async () => {
    if (loading) return;
    setLoading(true);

    const exportOrderReference = uuidv4(); // Generate a UUID for the export order

    const payload: ExportOrder = {
      id: newExportOrder.id ?? 0,
      reference: exportOrderReference,
      title: newExportOrder.title,
      description: newExportOrder.description,
      date: newExportOrder.date,
      status: ExportOrderStatuses.COMPLETE,
      batches: selectedBatches.map((batchId) => {
        const batch = batches.find((b) => b.id === parseInt(batchId.toString()));
        return batch ? { ...batch } : { id: 0, reference: "", productId: 0, date: new Date(), quantity: 0, description: "", name: "" };
      }),
    };

    const web3Service = web3ServiceFactory.getWeb3Service();
    try {
      const response = await exportOrderService.createExportOrderAsync(payload);
      if (response) {
        let nfTokenId = "";
        let sequence = 0;
        if (web3Service) {
          await web3Service.initAsync();
          await web3Service.chainClientInit();
          const accounts = await web3Service.getAccountsAsync();
          let accInfo = await web3Service.getAccountInfo();
          const res: any = await web3Service.mintNFT(Buffer.from(`${process.env.REACT_APP_METADATA_LINK_PREFIX}/${exportOrderReference}`).toString("hex").toUpperCase());
          if (!accInfo) {
            sequence = (res as any)?.tx_json?.Sequence;}
            else {
              sequence = (accInfo as any).MintedNFTokens + (accInfo as any).FirstNFTokenSequence;
            }
          console.log("Mint NFT", res?.engine_result);
          nfTokenId = UtilHelper.getNFTokenId(9, 0, 0, accounts[0], sequence);
        }
        const updated = await exportOrderService.updateExportOrderNftAsync(response.id, nfTokenId);
        setExportOrderList([
          {
            ...newExportOrder,
            id: response.id,
            reference: exportOrderReference,
            date: newExportOrder.date,
            status: ExportOrderStatuses.COMPLETE,
            nFTokenId: nfTokenId,
            batches: selectedBatches.map((batchId) => batches.find((batch) => batch.id === parseInt(batchId))!),
          },
          ...exportOrderList,
        ]);
        setSelectedBatches(selectedBatches.map((batchId) => batchId));
        setNewExportOrder({
          id: response.id,
          reference: exportOrderReference,
          date: payload.date,
          title: payload.title,
          description: payload.description,
          nFTokenId: nfTokenId,
        });
        setSelectedBatches([]);
        if (!updated) {
          setWarningMessage("Failed to update order. Please try again.");
        } else {
          setShowBatchModal(false);
        }
      } else {
        setWarningMessage("Failed to save export order. Please try again.");
      }
    } catch (error) {
      console.log(error);
      setWarningMessage("Failed to save export order. Please try again.");
    } finally {
      await web3Service?.chainClientDeinit();
      setLoading(false);
    }
  };

  const handleViewExportOrder = async (order: ExportOrder) => {
    const orderDetails = await exportOrderService.viewExportOrderAsync(order.id);
    setSelectedOrder(orderDetails);
    setShowModal(true);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(exportOrderList.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const paginatedExportOrders = exportOrderList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isFormValid = newExportOrder.title && newExportOrder.description && newExportOrder.date;

  const resetForm = () => {
    setNewExportOrder({ id: 0, reference: "", title: "", description: "", date: new Date(), nFTokenId: "" });
    setSelectedBatches([]);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null); // Reset selectedOrder state
    resetForm();
  };

  const handleCloseBatchModal = () => {
    setShowBatchModal(false);
    resetForm();
  };

  const handleBatchChange = (batchId: string) => {
    setSelectedBatches((prevSelectedBatches) => (prevSelectedBatches.includes(batchId) ? prevSelectedBatches.filter((id) => id !== batchId) : [...prevSelectedBatches, batchId]));
  };

  return (
    <div className="export-orders-page">
      <h1>Export Orders</h1>
      <Button
        className="add-button"
        onClick={() => {
          resetForm();
          setSelectedOrder(null); // Reset selectedOrder state
          setShowModal(true);
        }}
      >
        New Export Order
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
                  <th className="date-header-name">Date</th>
                  <th className="description-header-name">Description</th>
                  <th className="batches-header-name">Products</th>
                  <th className="action-header-name">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedExportOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No export orders added</td>
                  </tr>
                ) : (
                  paginatedExportOrders.map((order, index) => (
                    <tr key={index}>
                      <td>{order.title}</td>
                      <td>{new Date(order.date).toLocaleDateString()}</td>
                      <td>{order.description}</td>
                      <td>
                        {(order.batches ?? []).map((batch, index) => (
                          <Badge key={index} bg="success" className="product-badge">
                            {batch?.product?.name}
                          </Badge>
                        ))}
                      </td>
                      <td>
                        <Button className="eye-button" data-title="View Export Order" onClick={() => handleViewExportOrder(order)}>
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                        {order.nFTokenId && (
                          <Button className="history-button" data-title="View Export Order Provenance" onClick={() => window.open(UtilHelper.getNftLink(order.nFTokenId!), "_blank")}>
                            <FontAwesomeIcon icon={faCubes} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {exportOrderList.length > itemsPerPage && (
              <div className="pagination-container">
                {currentPage > 1 && (
                  <span className="page-number previous" onClick={handlePreviousPage}>
                    Previous
                  </span>
                )}
                {Array.from({ length: Math.ceil(exportOrderList.length / itemsPerPage) }, (_, index) => (
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
          <Modal.Title>{selectedOrder ? "Export Order Details" : "Create New Export Order"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder ? (
            <div>
              <p>
                <strong>Id:</strong> {selectedOrder.reference}
              </p>
              <p>
                <strong>Title:</strong> {selectedOrder.title}
              </p>
              <p>
                <strong>Order Date:</strong> {new Date(selectedOrder.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Description:</strong> {selectedOrder.description}
              </p>
              <p>
                <strong>Products:</strong>{" "}
                {(selectedOrder.batches ?? []).map((batch, index) => (
                  <Badge key={index} bg="success" className="product-badge">{`${batch?.product?.name} (${batch?.description})`}</Badge>
                ))}
              </p>
              {selectedOrder.nFTokenId && (
                <p>
                  <strong>NFT:</strong>{" "}
                  <a href={UtilHelper.getNftLink(selectedOrder.nFTokenId!)} target="_blank" rel="noreferrer">
                    {selectedOrder.nFTokenId.slice(0, 40)}...
                  </a>
                </p>
              )}
            </div>
          ) : (
            <Form>
              {warningMessage && <Alert variant="danger">{warningMessage}</Alert>}
              <Form.Group controlId="formExportOrderTitle" className="form-group">
                <Form.Label className="required">Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter export order title"
                  value={newExportOrder.title}
                  onChange={(e) => setNewExportOrder({ ...newExportOrder, title: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formExportOrderDescription" className="form-group">
                <Form.Label className="required">Description</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter export order details"
                  value={newExportOrder.description}
                  onChange={(e) => setNewExportOrder({ ...newExportOrder, description: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formExportOrderDate" className="form-group">
                <Form.Label className="required">Order Date</Form.Label>
                <div className="input-group">
                  <DatePicker
                    selected={newExportOrder.date}
                    onChange={(date: Date) => setNewExportOrder({ ...newExportOrder, date })}
                    dateFormat="MM/dd/yyyy"
                    customInput={<Form.Control type="text" placeholder="Select order date" value={newExportOrder.date?.toLocaleDateString()} required readOnly />}
                    icon={<FontAwesomeIcon icon={faCalendarAlt} />}
                  />
                  <div className="input-group-append">
                    <span className="input-group-text">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </span>
                  </div>
                </div>
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
                  setShowBatchModal(true);
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
      <Modal show={showBatchModal} onHide={handleCloseBatchModal} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Select Products</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formBatchType">
            <Form.Label className="required"> Available Products</Form.Label>
            {batches.map((batch) => (
              <Form.Check
                key={batch.id}
                type="checkbox"
                label={
                  <>
                    {`${batch?.product?.name} (${batch?.description}) `}
                    <a href={`${process.env.REACT_APP_PROVEANCE_LINK_PREFIX}/${batch.reference}`} target="_blank" rel="noopener noreferrer">
                      <FontAwesomeIcon color="gray" icon={faHistory} className="blink-hover" />
                    </a>
                  </>
                }
                value={batch.id.toString()}
                checked={selectedBatches.includes(batch.id.toString())}
                onChange={() => handleBatchChange(batch.id.toString())}
              />
            ))}
          </Form.Group>
          {loading && <LoaderSmall style={{ height: "10vh" }} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCreateExportOrder} disabled={newExportOrder.id > 0}>
            Create
          </Button>
          <Button variant="secondary" onClick={handleCloseBatchModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
