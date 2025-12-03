import { useData } from '../context/DataContext';

const ChildList = ({ onSelect }) => {
    const { kids } = useData();

    return (
        <div className="child-list">
            {kids.map(kid => (
                <div key={kid.id} className="child-card" onClick={() => onSelect(kid.id)}>
                    <div className="child-info">
                        <h3>{kid.name}</h3>
                    </div>
                    <div className={`child-score ${kid.score >= 5 ? 'good-score' : 'bad-score'}`}>
                        {kid.score}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChildList;
