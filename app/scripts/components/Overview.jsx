import React, { useState, useEffect } from 'react';
import { useClientInfoService } from '../hooks/useClientInfoService';

const Overview = ({ portService }) => {
  const {
    clientInfo,
    getBasicInfo,
    enableCobrowse,
    showCobrowse,
    showClient,
    showButton
  } = useClientInfoService(portService.sendAsyncMessage);

  const [cobrowse, setCobrowse] = useState(false);
  const [showRooms, setShowRooms] = useState(false);

  const currentVersion = "2.0.0";

  // Effect to load basic info when port becomes connected
  useEffect(() => {
    if (portService.isConnected) {
      getBasicInfo()
        .then((result) => {
          // Basic info loaded successfully
        })
        .catch((error) => {
          console.error('Failed to load basic info:', error);
        });
    }
  }, [portService.isConnected, getBasicInfo]);

  // Effect to listen for cobrowse status updates
  useEffect(() => {
    const unlistenCobrowse = portService.onMessage('cobrowseLoaded', (data) => {
      setCobrowse(data);
    });

    return unlistenCobrowse;
  }, [portService.onMessage]);
  const handleEnableCobrowse = () => {
    enableCobrowse().catch(console.error);
  };

  const handleShowCobrowse = () => {
    showCobrowse().catch(console.error);
  };

  const handleShowClient = () => {
    showClient().catch(console.error);
  };

  const handleShowButton = () => {
    showButton().catch(console.error);
  };

  return (
    <div>
      <span className="text-muted pull-right">
        <span className="version-text">Duke2-{currentVersion}</span>
      </span>
      <h3>Overview</h3>
      <ul className="list-group">
        <li className={`list-group-item ${clientInfo.hasGiosg ? 'list-group-item-success' : 'list-group-item-danger'}`}>
          Giosg script loaded
          {clientInfo.hasGiosg ? (
            <i className="fa fa-check text-success pull-right"></i>
          ) : (
            <i className="fa fa-times text-danger pull-right"></i>
          )}
        </li>

        <li className={`list-group-item ${clientInfo.isCompatible ? 'list-group-item-success' : 'list-group-item-danger'}`}>
          No compatibility issues detected
          {clientInfo.isCompatible ? (
            <i className="fa fa-check text-success pull-right"></i>
          ) : (
            <i className="fa fa-times text-danger pull-right"></i>
          )}
        </li>

        <li className={`list-group-item ${clientInfo.rooms?.length ? 'list-group-item-success' : 'list-group-item-danger'}`}>
          <a
            href="javascript:void(0)"
            onClick={() => setShowRooms(!showRooms)}
            className="text-success"
          >
            Rooms connected
            {clientInfo.rooms?.length ? (
              <i className={`fa ${showRooms ? 'fa-caret-up' : 'fa-caret-down'}`}></i>
            ) : null}
          </a>
          <span className={`pull-right ${clientInfo.rooms?.length ? 'text-success' : 'text-danger'}`}>
            {clientInfo.rooms?.length || 0}
          </span>
          {showRooms && (
            <div>
              {clientInfo.rooms?.map((room, index) => (
                <code key={index}>{room}<br/></code>
              ))}
            </div>
          )}
        </li>

        <li className={`list-group-item ${clientInfo.rules?.length ? 'list-group-item-success' : 'list-group-item-warning'}`}>
          Rules configured
          <span className={`pull-right ${clientInfo.rules?.length ? 'text-success' : 'text-danger'}`}>
            {clientInfo.rules?.length || 0}
          </span>
        </li>

        <li className={`list-group-item ${clientInfo.enabledCartSelectors?.length ? 'list-group-item-success' : 'list-group-item-warning'}`}>
          Shoppingcart selectors enabled
          <span className={`pull-right ${clientInfo.enabledCartSelectors?.length ? 'text-success' : 'text-danger'}`}>
            {clientInfo.enabledCartSelectors?.length || 0}
          </span>
        </li>
      </ul>

      <button className="btn btn-info btn-sm" onClick={handleShowButton}>
        <i className="fa fa-plus"></i>&nbsp;Show Chat Button
      </button>
      <button className="btn btn-success btn-sm" onClick={handleShowClient}>
        <i className="fa fa-eye"></i>&nbsp;Show Chat Window
      </button>
      <br/>
      <button 
        className="btn btn-info btn-sm" 
        disabled={cobrowse} 
        onClick={handleEnableCobrowse}
      >
        <i className="fa fa-plus"></i>&nbsp;Enable CoBrowse
      </button>
      <button 
        className="btn btn-success btn-sm" 
        disabled={!cobrowse} 
        onClick={handleShowCobrowse}
      >
        <i className="fa fa-eye"></i>&nbsp;Show CoBrowse
      </button>

      <div className="technical-info">
        <strong>Company ID</strong>
        {clientInfo.companyId && <kbd>{clientInfo.companyId}</kbd>}<br />
        <strong>Domain ID</strong>
        {clientInfo.domainId && <kbd>{clientInfo.domainId}</kbd>}<br />
        <strong>Company ID</strong>
        {clientInfo.companyId && <kbd>{clientInfo.companyId}</kbd>}<br />
        <strong>Visitor CID</strong>
        {clientInfo.visitorCid && <kbd>{clientInfo.visitorCid}</kbd>}<br />
        <strong>Visitor GID</strong>
        {clientInfo.visitorGid && <kbd>{clientInfo.visitorGid}</kbd>}
      </div>
    </div>
  );
};

export default Overview;
