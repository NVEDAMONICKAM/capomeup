export function InputButtons({ method, handleCheckboxChange, bracketsEnabled }) {
	return (<div className='input-buttons'>
		<label>
			Indent Method:
			<input type="checkbox" checked={method === 'indent'} onChange={handleCheckboxChange} />
		</label>
		<div>
			<input type="text" value="[" disabled={!bracketsEnabled} style={{
				width: '30px',
				marginRight: '10px'
			}} />
			<input type="text" value="]" disabled={!bracketsEnabled} style={{
				width: '30px'
			}} />
		</div>
	</div>);
}
