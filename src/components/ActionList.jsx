import { useData } from '../context/DataContext';

const ActionList = ({ childId }) => {
    const { actions, logAction } = useData();

    const goodActions = actions.filter(a => a.type === 'good');
    const badActions = actions.filter(a => a.type === 'bad');

    return (
        <div className="action-container">
            <div className="action-section good">
                <h3>Bonnes Actions (+0.5)</h3>
                <div className="action-grid">
                    {goodActions.map(action => (
                        <button
                            key={action.id}
                            className="action-btn good-btn"
                            onClick={() => logAction(childId, action.id)}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="action-section bad">
                <h3>Mauvaises Actions (-0.5)</h3>
                <div className="action-grid">
                    {badActions.map(action => (
                        <button
                            key={action.id}
                            className="action-btn bad-btn"
                            onClick={() => logAction(childId, action.id)}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActionList;
