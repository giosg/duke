import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientInfoService } from '../hooks/useClientInfoService';
import { usePersistentState } from '../hooks/usePersistentState';
import _ from 'lodash';

const RuleConditionController = ({ ruleCondition, ruleId, conditionIndex, clientInfo, onRuleStatesUpdate, portService }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCondition, setEditedCondition] = useState({
    value: '',
    type: ''
  });
  const { editRuleCondition } = useClientInfoService(portService.sendAsyncMessage);

  const startEditing = (condition) => {
    setIsEditing(true);
    setEditedCondition({
      value: condition.value,
      type: condition.type,
    });
  };

  const stopEditing = () => {
    setIsEditing(false);
  };

  const submitRuleCondition = async (e) => {
    e.preventDefault();
    try {
      const ruleStates = await editRuleCondition(
        ruleId,
        conditionIndex,
        editedCondition.value,
        editedCondition.type
      );
      onRuleStatesUpdate(ruleStates);
      stopEditing();
    } catch (error) {
      console.error('Failed to submit rule condition:', error);
    }
  };

  return (
    <div>
      {!isEditing ? (
        <>
          <code style={{ whiteSpace: 'pre-line' }}>
            {ruleCondition.condition.value || "NO VALUE"}
          </code>
          {clientInfo.ruleEngine && (
            <a href="javascript:void(0);" onClick={() => startEditing(ruleCondition.condition)}>
              <i className="fa fa-fw fa-pencil"></i>
              Edit
            </a>
          )}
        </>
      ) : (
        <form className="input-group" onSubmit={submitRuleCondition}>
          <input
            type="text"
            className="form-control"
            value={editedCondition.value}
            onChange={(e) => setEditedCondition(prev => ({ ...prev, value: e.target.value }))}
            placeholder="No value"
          />
          <span className="input-group-btn">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-danger" onClick={stopEditing}>Cancel</button>
          </span>
        </form>
      )}
    </div>
  );
};

const Rules = ({ portService }) => {
  const navigate = useNavigate();
  const { clientInfo, getBasicInfo, getRuleStates } = useClientInfoService(portService.sendAsyncMessage);
  const { isConnected, onMessage } = portService;
  const [ruleStates, setRuleStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm, isSearchLoaded] = usePersistentState('rulesSearchTerm', '');
  const [expandedRules, setExpandedRules, isExpandedLoaded] = usePersistentState('expandedRules', {});

  // Effects for persistent state restoration

  // Function to toggle rule expansion
  const toggleRuleExpansion = useCallback((ruleId) => {
    setExpandedRules(prevExpanded => {
      const newExpanded = {
        ...prevExpanded,
        [ruleId]: !prevExpanded[ruleId]
      };
      return newExpanded;
    });
  }, [setExpandedRules]);

  useEffect(() => {
    const loadRulesData = async () => {
      // Only load data if port is connected
      if (!portService.isConnected) {
        return;
      }

      setLoading(true);
      try {
        // Ensure we have basic client info first
        if (!clientInfo.hasGiosg) {
          await getBasicInfo();
        }

        const data = await getRuleStates();
        setRuleStates(data || []);
      } catch (error) {
        console.error('Failed to load rules:', error);
        // Retry after a delay if it's not a permanent error
        if (error.message !== 'Content script not ready') {
          setTimeout(() => {
            loadRulesData();
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    // Load data if port is connected
    loadRulesData();

    // Listen for rule state changes
    const unlistenRules = onMessage('ruleStateChange', (newRuleStates) => {
      setRuleStates(newRuleStates || []);
    });

    return () => {
      unlistenRules();
    };
  }, [portService.isConnected, clientInfo.hasGiosg, getBasicInfo, getRuleStates, onMessage]);

  const getActionTypeLabel = (actionType) => {
    const label = clientInfo.ruleactionTypes?.[actionType];
    return label && label.replace(/_/g, " ");
  };

  const getConditionTypeLabel = (conditionType) => {
    const label = clientInfo.ruleconditionTypes?.[conditionType];
    return label && label.replace(/_/g, " ");
  };

  const getRulePanelClass = (ruleItem) => {
    return "panel-" + getRuleClassSuffix(ruleItem);
  };

  const getRuleLabelClass = (ruleItem) => {
    return "label-" + getRuleClassSuffix(ruleItem);
  };

  const getRuleClassSuffix = (ruleItem) => {
    if (ruleItem.state === "pending") {
      return "default";
    } else if (ruleItem.evented) {
      // Use 'danger' class if there is at least one non-matching condition that is not event condition
      const cannotMatch = _.some(
        ruleItem.ruleConditions
          .concat(ruleItem.commonConditions)
          .concat(ruleItem.actionConditions),
        (condition) => !condition.evented && condition.state === "passive"
      );
      return cannotMatch ? "danger" : "info";
    } else if (ruleItem.state === "active") {
      return "success";
    }
    return "danger";
  };

  const reload = async () => {
    navigate('/rules', { replace: true });
    setLoading(true);
    try {
      const data = await getRuleStates();
      setRuleStates(data || []);
    } catch (error) {
      console.error('Failed to reload rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConditionTitle = (condition) => {
    /*
     * Find the first block comment inside the condition string and use its contents as a title.
     * This also ignores any leading '!', used to avoid JS comment removal on obfuscation.
     */
    const match = /\/\*\!?\s*(.+?)\s*\*\//.exec(condition);
    return match ? match[1] : "[Custom condition]";
  };

  // Filter and sort rules into two sections: matching first, then others
  const filterAndSortRules = (rules) => {
    return rules
      .filter(rule => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        const ruleName = (rule.rule.name || '').toLowerCase();
        const ruleId = (rule.rule.id || '').toString().toLowerCase();
        return ruleName.includes(searchLower) || ruleId.includes(searchLower);
      })
      .sort((a, b) => {
        const nameA = (a.rule.name || '(Unnamed rule)').toLowerCase();
        const nameB = (b.rule.name || '(Unnamed rule)').toLowerCase();
        return nameA.localeCompare(nameB);
      });
  };

  const filteredAndSortedRules = filterAndSortRules(ruleStates);

  // Separate into matching (active) and non-matching sections
  const matchingRules = filteredAndSortedRules.filter(rule => rule.state === 'active');
  const nonMatchingRules = filteredAndSortedRules.filter(rule => rule.state !== 'active');

  return (
    <div>
      <a href="javascript:void(0);" className="pull-right" onClick={reload} disabled={loading}>
        <i className={`fa fa-fw ${loading ? 'fa-spin fa-spinner' : 'fa-refresh'}`}></i>
        {loading ? 'Loading...' : 'Reload'}
      </a>
      <h3>
        Rules
        <small>
          {matchingRules.length} matching, {nonMatchingRules.length} others
          {searchTerm && ` (filtered from ${ruleStates.length} total)`}
        </small>
      </h3>

      {/* Search input */}
      <div className="form-group" style={{ marginBottom: '15px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0 15px' }}>
        <div className="input-group" style={{ display: 'flex', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <span className="input-group-addon" style={{ flex: '0 0 auto', padding: '6px 12px', backgroundColor: '#eee', border: '1px solid #ccc', borderRight: 'none', borderRadius: '4px 0 0 4px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa fa-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search rules by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: '1 1 auto',
              borderRadius: '0',
              borderLeft: 'none',
              borderRight: searchTerm ? 'none' : '1px solid #ccc',
              boxSizing: 'border-box',
              minWidth: 0,
              maxWidth: searchTerm ? 'calc(100% - 72px)' : 'calc(100% - 40px)'
            }}
          />
          {searchTerm && (
            <span className="input-group-btn" style={{ flex: '0 0 auto', marginLeft: 0 }}>
              <button
                className="btn btn-default"
                type="button"
                onClick={() => setSearchTerm('')}
                title="Clear search"
                style={{
                  borderRadius: '0 4px 4px 0',
                  borderLeft: 'none',
                  margin: 0,
                  height: '34px',
                  padding: '6px 8px',
                  boxSizing: 'border-box',
                  flex: '0 0 auto',
                  minWidth: '32px',
                  width: '32px'
                }}
              >
                <i className="fa fa-times"></i>
              </button>
            </span>
          )}
        </div>
      </div>
      
      {loading && ruleStates.length === 0 && (
        <div className="text-center" style={{ padding: '20px' }}>
          <i className="fa fa-spinner fa-spin fa-2x"></i>
          <p>Loading rules...</p>
        </div>
      )}
      
      {!loading && ruleStates.length === 0 && (
        <div className="text-center text-muted" style={{ padding: '20px' }}>
          <i className="fa fa-exclamation-triangle fa-2x"></i>
          <p>No rules found or failed to load rules.</p>
          <p>Make sure you're on a page with Giosg chat enabled.</p>
        </div>
      )}

      {!loading && ruleStates.length > 0 && filteredAndSortedRules.length === 0 && (
        <div className="text-center text-muted" style={{ padding: '20px' }}>
          <i className="fa fa-search fa-2x"></i>
          <p>No rules match your search term "{searchTerm}".</p>
          <button
            className="btn btn-default btn-sm"
            onClick={() => setSearchTerm('')}
          >
            Clear search
          </button>
        </div>
      )}

      {/* Matching Rules Section */}
      {matchingRules.length > 0 && (
        <div>
          <h4 style={{ marginTop: '20px', color: '#28a745' }}>
            <i className="fa fa-check"></i> Matching Rules ({matchingRules.length})
          </h4>
          <div className="panel-group">
            {matchingRules.map((ruleItem, index) => (
              <RulePanel
                key={ruleItem.rule.id || `matching-${index}`}
                ruleItem={ruleItem}
                index={index}
                getActionTypeLabel={getActionTypeLabel}
                getConditionTypeLabel={getConditionTypeLabel}
                getRulePanelClass={getRulePanelClass}
                getRuleLabelClass={getRuleLabelClass}
                getConditionTitle={getConditionTitle}
                clientInfo={clientInfo}
                onRuleStatesUpdate={setRuleStates}
                portService={portService}
                isExpanded={expandedRules[ruleItem.rule.id] || false}
                onToggleExpansion={() => toggleRuleExpansion(ruleItem.rule.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Non-Matching Rules Section */}
      {nonMatchingRules.length > 0 && (
        <div>
          <h4 style={{ marginTop: '20px', color: '#6c757d' }}>
            <i className="fa fa-list"></i> Other Rules ({nonMatchingRules.length})
          </h4>
          <div className="panel-group">
            {nonMatchingRules.map((ruleItem, index) => (
              <RulePanel
                key={ruleItem.rule.id || `nonmatching-${index}`}
                ruleItem={ruleItem}
                index={index}
                getActionTypeLabel={getActionTypeLabel}
                getConditionTypeLabel={getConditionTypeLabel}
                getRulePanelClass={getRulePanelClass}
                getRuleLabelClass={getRuleLabelClass}
                getConditionTitle={getConditionTitle}
                clientInfo={clientInfo}
                onRuleStatesUpdate={setRuleStates}
                portService={portService}
                isExpanded={expandedRules[ruleItem.rule.id] || false}
                onToggleExpansion={() => toggleRuleExpansion(ruleItem.rule.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RulePanel = ({
  ruleItem,
  index,
  getActionTypeLabel,
  getConditionTypeLabel,
  getRulePanelClass,
  getRuleLabelClass,
  getConditionTitle,
  clientInfo,
  onRuleStatesUpdate,
  portService,
  isExpanded,
  onToggleExpansion
}) => {
  return (
    <div className={`panel ${getRulePanelClass(ruleItem)}`}>
      <div className="panel-heading">
        <i className={`fa fa-fw ${isExpanded ? 'fa-caret-down' : 'fa-caret-right'}`}></i>
        {ruleItem.rule.autoCreated && (
          <span className={`label ${getRuleLabelClass(ruleItem)}`} title="This rule was automatically created">
            Auto
          </span>
        )}
        <a href="javascript:void(0);" onClick={onToggleExpansion}>
          {ruleItem.rule.name || <em>(Unnamed rule)</em>}
        </a>
        {ruleItem.evented && (
          <span className="fa fa-fw fa-calendar pull-right" title="Rule triggers on an event"></span>
        )}
        {!ruleItem.evented && (
          <>
            {ruleItem.state === 'active' && (
              <span className="fa fa-fw fa-check pull-right" title="All rule conditions match!"></span>
            )}
            {ruleItem.state === 'passive' && (
              <span className="fa fa-fw fa-times pull-right" title="Some rule conditions do not match"></span>
            )}
            {ruleItem.state === 'pending' && (
              <span className="fa fa-fw fa-question pull-right" title="Rule conditions are being checked…"></span>
            )}
          </>
        )}
      </div>
      
      {isExpanded && (
        <div className="panel-collapse collapse in">
          <div className="panel-body">
            {ruleItem.rule.matchOnceOnPage && (
              <div className="text-warning">
                <i className="fa fa-fw fa-file-o"></i>
                Rule can match only once <strong>on page</strong>
              </div>
            )}
            {ruleItem.rule.matchOnceInSession && (
              <div className="text-warning">
                <i className="fa fa-fw fa-clock-o"></i>
                Rule can match only once <strong>in session</strong>
              </div>
            )}
            {ruleItem.rule.matchOnceForVisitor && (
              <div className="text-warning">
                <i className="fa fa-fw fa-user"></i>
                Rule can match only once <strong>for visitor</strong>
              </div>
            )}
            
            <h5>Target rooms:</h5>
            {ruleItem.rule.targetAnyRoom ? (
              <p className="text-success">Any room</p>
            ) : (
              <p>
                {ruleItem.rule.targetRooms?.length ? (
                  ruleItem.rule.targetRooms.map((roomUuid, i) => (
                    <span key={i}>
                      <code>{roomUuid}</code>
                      {i < ruleItem.rule.targetRooms.length - 1 && ', '}
                    </span>
                  ))
                ) : (
                  <em className="text-danger">No rooms</em>
                )}
              </p>
            )}
            
            <h5>
              Actions:
              {ruleItem.rule.actions?.map((action, i) => (
                <strong key={i} className="text-primary">
                  <span>{getActionTypeLabel(action.type) || `ACTION TYPE ${action.type}`}</span>
                  {i < ruleItem.rule.actions.length - 1 && ', '}
                </strong>
              ))}
            </h5>
            {ruleItem.rule.action?.value && (
              <pre>{ruleItem.rule.action.value}</pre>
            )}

            <hr style={{ marginTop: '2px', marginBottom: '2px' }} />
            
            {ruleItem.ruleConditions?.length > 0 && (
              <>
                <h5>Rule Conditions</h5>
                {ruleItem.ruleConditions.map((ruleCondition, conditionIndex) => (
                  <RuleConditionItem
                    key={conditionIndex}
                    ruleCondition={ruleCondition}
                    ruleId={ruleItem.rule.id}
                    conditionIndex={conditionIndex}
                    getConditionTypeLabel={getConditionTypeLabel}
                    clientInfo={clientInfo}
                    onRuleStatesUpdate={onRuleStatesUpdate}
                    portService={portService}
                  />
                ))}
              </>
            )}

            {ruleItem.commonConditions?.length > 0 && (
              <>
                <h5>Common Conditions</h5>
                {ruleItem.commonConditions.map((ruleCondition, i) => (
                  <CommonConditionItem
                    key={i}
                    ruleCondition={ruleCondition}
                    getConditionTitle={getConditionTitle}
                  />
                ))}
              </>
            )}

            {ruleItem.actionConditions?.length > 0 && (
              <>
                <h5>Action Conditions</h5>
                {ruleItem.actionConditions.map((ruleCondition, i) => (
                  <CommonConditionItem
                    key={i}
                    ruleCondition={ruleCondition}
                    getConditionTitle={getConditionTitle}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const RuleConditionItem = ({
  ruleCondition,
  ruleId,
  conditionIndex,
  getConditionTypeLabel,
  clientInfo,
  onRuleStatesUpdate,
  portService
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div>
      <a href="javascript:void(0);" onClick={() => setShowSettings(!showSettings)}>
        {ruleCondition.evented ? (
          <span className="fa fa-fw fa-calendar text-info" title="Condition triggers on an event"></span>
        ) : (
          <>
            {ruleCondition.state === 'active' && (
              <span className="fa fa-fw fa-check text-success" title="Condition matches!"></span>
            )}
            {ruleCondition.state === 'passive' && (
              <span className="fa fa-fw fa-times text-danger" title="Condition does not match"></span>
            )}
            {ruleCondition.state === 'pending' && (
              <span className="fa fa-fw fa-question text-muted" title="Condition is being checked…"></span>
            )}
          </>
        )}
        <strong className={
          ruleCondition.evented ? 'text-info' : 
          ruleCondition.state === 'active' ? 'text-success' : 
          ruleCondition.state === 'passive' ? 'text-danger' : 'text-default'
        }>
          {getConditionTypeLabel(ruleCondition.condition.type)}
        </strong>
        <span>
          {ruleCondition.condition.negate ? ' does NOT match' : ' matches'}
        </span>
        <i className={`fa ${showSettings ? 'fa-caret-up' : 'fa-caret-down'}`}></i>
      </a>

      <RuleConditionController
        ruleCondition={ruleCondition}
        ruleId={ruleId}
        conditionIndex={conditionIndex}
        clientInfo={clientInfo}
        onRuleStatesUpdate={onRuleStatesUpdate}
        portService={portService}
      />
      
      {showSettings && (
        <pre style={{ clear: 'left' }}>
          {JSON.stringify(ruleCondition.condition.settings, null, 2)}
        </pre>
      )}
    </div>
  );
};

const CommonConditionItem = ({ ruleCondition, getConditionTitle }) => {
  const [showConditionSource, setShowConditionSource] = useState(false);

  return (
    <div>
      {ruleCondition.state === 'active' && (
        <span className="fa fa-fw fa-check text-success" title="Condition matches!"></span>
      )}
      {ruleCondition.state === 'passive' && (
        <span className="fa fa-fw fa-times text-danger" title="Condition does not match"></span>
      )}
      {ruleCondition.state === 'pending' && (
        <span className="fa fa-fw fa-question text-muted" title="Condition is being checked…"></span>
      )}
      <a href="javascript:void(0);" onClick={() => setShowConditionSource(!showConditionSource)}>
        <i className={`fa fa-fw ${showConditionSource ? 'fa-caret-down' : 'fa-caret-right'}`}></i>
        {getConditionTitle(ruleCondition.condition)}
      </a>
      {showConditionSource && (
        <pre className="small">{ruleCondition.condition}</pre>
      )}
    </div>
  );
};

export default Rules;
