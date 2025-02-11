const Counter = ({ label, value, onIncrement, onDecrement, details = <></> }) => {
    return (
        <div style={{ width: '100%', textAlign: 'center', marginBottom: '20px' }}>
            <strong>{label}:</strong> {value}
            {details}
            <button onClick={onIncrement} style={{ marginLeft: '10px' }}>+</button>
            <button onClick={onDecrement} style={{ marginLeft: '10px' }}>-</button>
        </div>
    );
};

export default Counter;