import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./home.scss";
import { Button, Modal, Form, Alert, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faHistory, faEye, faCubes } from "@fortawesome/free-solid-svg-icons";
import { useServiceProvider } from "../../providers/service-provider";
import LoaderSmall from "../../components/loader-small";
import UtilHelper from "../../utils/util-helper";
import React from "react";
import axios from "axios";
export default function Home() {
  const [loading, setLoading] = useState(false);
  const [policyListLoading, setPolicyListLoading] = useState(true);
  const [policyList, setPolicyList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState<{ id: number; reference: string; fullName: string; policyType: string; nFTokenId: string }>({
    id: 0,
    reference: "",
    fullName: "",
    policyType: "",
    nFTokenId: "",
  });
  const [selectedLeases, setSelectedLeases] = useState<string[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);
  const itemsPerPage = 10;
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const { policyService, leaseService } = useServiceProvider();

  const loadDataAsync = useCallback(async () => {
    try {
      if (policyService) {
        setPolicyListLoading(true);
        const policyList = await policyService.getPoliciesAsync();
        setPolicyList(policyList ?? []);
        setPolicyListLoading(false);
      }
    } finally {
    }
  }, [policyService]);

  const loadLeasesAsync = useCallback(async () => {
    try {
      const leases = await leaseService.getLeasesAsync();
      setLeases(leases ?? []);
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

  const handleCreatePolicy = async () => {
    if (loading) return;
    setLoading(true);

    const policyReference = uuidv4(); // Generate a UUID for the policy

    const payload: any = {
      id: newPolicy.id ?? 0,
      reference: policyReference,
      fullName: newPolicy.fullName,
      policyType: newPolicy.policyType,
      leases: selectedLeases.map((leaseId) => {
        const lease = leases.find((l) => l.id === parseInt(leaseId.toString()));
        return lease ? { ...lease } : { id: 0, reference: "", description: "" };
      }),
    };

    try {
      const response = await policyService.createPolicyAsync(payload);
      if (response) {
        const metadataResponse = await axios.post(`${process.env.REACT_APP_METADATA_LINK_PREFIX}/${policyReference}`, payload);
        const metadataUrl = (metadataResponse.data as { url: string }).url;

        const mintResponse = await axios.post("/api/mint-nft", {
          address: process.env.REACT_APP_NFT_ADDRESS,
          secret: process.env.REACT_APP_NFT_SECRET,
          metadataUrl,
        });

        //   const nfTokenId = (mintResponse.data as { nfTokenId: string }).nfTokenId;
        const nftAddress = process.env.REACT_APP_NFT_ADDRESS;
        if (!nftAddress) {
          throw new Error("NFT address is not defined");
        }
        const nfTokenId = UtilHelper.getNFTokenId(9, 0, 0, nftAddress, (mintResponse.data as { sequence: number }).sequence);

        const updated = await policyService.updatePolicyNftAsync(response.id, nfTokenId);
        setPolicyList([
          {
            ...newPolicy,
            id: response.id,
            reference: policyReference,
            nFTokenId: nfTokenId,
            leases: selectedLeases.map((leaseId) => leases.find((lease) => lease.id === parseInt(leaseId))!),
          },
          ...policyList,
        ]);
        setSelectedLeases(selectedLeases.map((leaseId) => leaseId));
        setNewPolicy({
          id: response.id,
          reference: policyReference,
          fullName: payload.fullName,
          policyType: payload.policyType,
          nFTokenId: nfTokenId,
        });
        setSelectedLeases([]);
        if (!updated) {
          setWarningMessage("Failed to update policy. Please try again.");
        } else {
          setShowLeaseModal(false);
        }
      } else {
        setWarningMessage("Failed to save policy. Please try again.");
      }
    } catch (error) {
      console.log(error);
      setWarningMessage("Failed to save policy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPolicy = async (policy: any) => {
    const policyDetails = await policyService.viewPolicyAsync(policy.id);
    setSelectedPolicy(policyDetails);
    setShowModal(true);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(policyList.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const paginatedPolicies = policyList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isFormValid = newPolicy.fullName && newPolicy.policyType;

  const resetForm = () => {
    setNewPolicy({ id: 0, reference: "", fullName: "", policyType: "", nFTokenId: "" });
    setSelectedLeases([]);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPolicy(null); // Reset selectedPolicy state
    resetForm();
  };

  const handleCloseLeaseModal = () => {
    setShowLeaseModal(false);
    resetForm();
  };

  const handleLeaseChange = (leaseId: string) => {
    setSelectedLeases((prevSelectedLeases) => (prevSelectedLeases.includes(leaseId) ? prevSelectedLeases.filter((id) => id !== leaseId) : [...prevSelectedLeases, leaseId]));
  };

  return (
    <>
      <div className="home-page"></div>
      <h1>Policy Create Form</h1>
      <Button
        className="add-button"
        onClick={() => {
          resetForm();
          setSelectedPolicy(null); // Reset selectedPolicy state
          setShowModal(true);
        }}
      >
        New Policy
      </Button>
      <div className="table-container">
        {policyListLoading ? (
          <LoaderSmall style={{ height: "50vh" }} />
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th className="id-header-name">ID</th>
                  <th className="nft-header-name">NFT Link</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPolicies.length === 0 ? (
                  <tr>
                    <td colSpan={2}>No policies added</td>
                  </tr>
                ) : (
                  paginatedPolicies.map((policy, index) => (
                    <tr key={index}>
                      <td>{policy.id}</td>
                      <td>
                        {policy.nFTokenId && (
                          <a href={UtilHelper.getNftLink(policy.nFTokenId)} target="_blank" rel="noreferrer">
                            {policy.nFTokenId.slice(0, 40)}...
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {policyList.length > itemsPerPage && (
              <div className="pagination-container">
                {currentPage > 1 && (
                  <span className="page-number previous" onClick={handlePreviousPage}>
                    Previous
                  </span>
                )}
                {Array.from({ length: Math.ceil(policyList.length / itemsPerPage) }, (_, index) => (
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
          <Modal.Title>{selectedPolicy ? "Policy Details" : "Create New Policy"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPolicy ? (
            <div>
              <p>
                <strong>Id:</strong> {selectedPolicy.reference}
              </p>
              <p>
                <strong>Full Name:</strong> {selectedPolicy.fullName}
              </p>
              <p>
                <strong>Policy Type:</strong> {selectedPolicy.policyType}
              </p>
              <p>
                <strong>Leases:</strong>{" "}
                {(selectedPolicy.leases ?? []).map((lease, index) => (
                  <Badge key={index} bg="success" className="lease-badge">{`${lease?.description}`}</Badge>
                ))}
              </p>
              {selectedPolicy.nFTokenId && (
                <p>
                  <strong>NFT:</strong>{" "}
                  <a href={UtilHelper.getNftLink(selectedPolicy.nFTokenId!)} target="_blank" rel="noreferrer">
                    {selectedPolicy.nFTokenId.slice(0, 40)}...
                  </a>
                </p>
              )}
            </div>
          ) : (
            <Form>
              {warningMessage && <Alert variant="danger">{warningMessage}</Alert>}
              <Form.Group controlId="formPolicyFullName" className="form-group">
                <Form.Label className="required">Full Name</Form.Label>
                <Form.Control type="text" placeholder="Enter full name" value={newPolicy.fullName} onChange={(e) => setNewPolicy({ ...newPolicy, fullName: e.target.value })} required />
              </Form.Group>
              <Form.Group controlId="formPolicyType" className="form-group">
                <Form.Label className="required">Policy Type</Form.Label>
                <Form.Control type="text" placeholder="Enter policy type" value={newPolicy.policyType} onChange={(e) => setNewPolicy({ ...newPolicy, policyType: e.target.value })} required />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedPolicy ? (
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
            <Form.Label className="required"> Available Leases</Form.Label>
            {leases.map((lease) => (
              <Form.Check
                key={lease.id}
                type="checkbox"
                label={lease.description}
                value={lease.id.toString()}
                checked={selectedLeases.includes(lease.id.toString())}
                onChange={() => handleLeaseChange(lease.id.toString())}
              />
            ))}
          </Form.Group>
          {loading && <LoaderSmall style={{ height: "10vh" }} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCreatePolicy} disabled={newPolicy.id > 0}>
            Create
          </Button>
          <Button variant="secondary" onClick={handleCloseLeaseModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
