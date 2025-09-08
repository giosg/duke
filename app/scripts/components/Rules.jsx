import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientInfoService } from '../hooks/useClientInfoService';
import { usePortService } from '../hooks/usePortService';
import _ from 'lodash';

const RuleConditionController = ({ ruleCondition, ruleId, conditionIndex, clientInfo, onRuleStatesUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCondition, setEditedCondition] = useState({
    value: '',
    type: ''
  });
  const { editRuleCondition } = useClientInfoService();

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

const Rules = () => {
  const navigate = useNavigate();
  const { clientInfo, getRuleStates } = useClientInfoService();
  const { onMessage } = usePortService();
  const [ruleStates, setRuleStates] = useState([]);

  useEffect(() => {
    // Load rule states on component mount
    getRuleStates().then(setRuleStates).catch(console.error);

    // Listen for rule state changes
    const unlistenRules = onMessage('ruleStateChange', (newRuleStates) => {
      setRuleStates(newRuleStates);
    });

    return unlistenRules;
  }, [getRuleStates, onMessage]);

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

  const reload = () => {
    navigate('/rules', { replace: true });
    getRuleStates().then(setRuleStates).catch(console.error);
  };

  const getConditionTitle = (condition) => {
    /*
     * Find the first block comment inside the condition string and use its contents as a title.
     * This also ignores any leading '!', used to avoid JS comment removal on obfuscation.
     */
    const match = /\/\*\!?\s*(.+?)\s*\*\//.exec(condition);
    return match ? match[1] : "[Custom condition]";
  };

  const activeRules = ruleStates.filter(rule => rule.state === 'active');

  return (
    <div>
      <a href="javascript:void(0);" className="pull-right" onClick={reload}>
        <i className="fa fa-fw fa-refresh"></i>
        Reload
      </a>
      <h3>
        Rules
        <small>
          {activeRules.length}/{ruleStates.length}
        </small>
      </h3>
      
      <div className="panel-group">
        {ruleStates.map((ruleItem, index) => (
          <RulePanel
            key={index}
            ruleItem={ruleItem}
            index={index}
            getActionTypeLabel={getActionTypeLabel}
            getConditionTypeLabel={getConditionTypeLabel}
            getRulePanelClass={getRulePanelClass}
            getRuleLabelClass={getRuleLabelClass}
            getConditionTitle={getConditionTitle}
            clientInfo={clientInfo}
            onRuleStatesUpdate={setRuleStates}
          />
        ))}
      </div>
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
  onRuleStatesUpdate
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`panel ${getRulePanelClass(ruleItem)}`}>
      <div className="panel-heading">
        <i className={`fa fa-fw ${expanded ? 'fa-caret-down' : 'fa-caret-right'}`}></i>
        {ruleItem.rule.autoCreated && (
          <span className={`label ${getRuleLabelClass(ruleItem)}`} title="This rule was automatically created">
            Auto
          </span>
        )}
        <a href="javascript:void(0);" onClick={() => setExpanded(!expanded)}>
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
      
      {expanded && (
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
  onRuleStatesUpdate 
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
