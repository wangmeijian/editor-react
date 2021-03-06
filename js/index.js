import '@css/index.less';
import React from 'react';
import Menu from '@plugins/Menu';
import DropMenu from '@plugins/DropMenu';
import classnames from 'classnames';
import PropTypes from 'prop-types';

class Index extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			menuStatus: {
				bold: false,
				underline: false,
				italic: false,
				indent: false,
				'align-left': false,
				'align-center': false,
				'align-right': false,
				undo: false,
				redo: false,
				fullscreen: false
			},
			dropMenuStatus: {
				heading: false,
				'font-colors': false,
				'font-size': false,
				link: false,
				image: false
			},
			linkUrl: '',
			imageUrl: ''
		};
		this.fontColors = [
			'#000000',
			'#E60000',
			'#FF9900',
			'#FFFF00',
			'#058A00',
			'#0066CC',
			'#9834FF',
			'#ffffff',
			'#FACCCC',
			'#FFEBCC',
			'#FFFFCC',
			'#CCE8CC',
			'#CCE0F5',
			'#EBD6FF',
			'#BBBBBB',
			'#F06666',
			'#FFC266',
			'#FFFF66',
			'#67B966',
			'#66A3E0',
			'#C285FF',
			'#888888',
			'#A10000',
			'#B26B00',
			'#B2B200',
			'#026100',
			'#0047B2',
			'#6B24B2',
			'#444444',
			'#5C0000',
			'#663D00',
			'#666600',
			'#013700',
			'#002966',
			'#3D1566'
		];
		this.fontSize = {
			'1': 'x-small',
			'2': 'small',
			'3': 'nromal',
			'4': 'large',
			'5': 'x-large',
			'6': 'xx-large'
		};
		this.heading = [
			{
				tag: 'H1',
				node: <h1>标题1</h1>
			},
			{
				tag: 'h2',
				node: <h2>标题2</h2>
			},
			{
				tag: 'h3',
				node: <h3>标题3</h3>
			},
			{
				tag: 'h4',
				node: <h4>标题4</h4>
			},
			{
				tag: 'h5',
				node: <h5>标题5</h5>
			},
			{
				tag: 'h6',
				node: <h6>标题6</h6>
			}
		];
		this.selection = {};

		this.save = this.save.bind(this);
		this.insert = this.insert.bind(this);
		this.hasFocus = this.hasFocus.bind(this);
		this.setHeader = this.setHeader.bind(this);
		this.setMenuStatus = this.setMenuStatus.bind(this);
		this.setOneMenuStatus = this.setOneMenuStatus.bind(this);
		this.setDropMenuStatus = this.setDropMenuStatus.bind(this);
		this.setFullScreenState = this.setFullScreenState.bind(this);
		this.compareNodesOrder = this.compareNodesOrder.bind(this);
	}
	componentDidMount() {
		let anchorNode = null;
		this.container = document.querySelector('.r-t-container');
		this.content = document.querySelector('.r-t-container .r-t-content');
		document.addEventListener(
			'webkitfullscreenchange',
			this.setFullScreenState
		);
		anchorNode = this.content.querySelector('h4').childNodes[0];
		this.selection = {
			anchorNode: anchorNode,
			anchorOffset: anchorNode.length,
			focusNode: anchorNode,
			focusOffset: anchorNode.length,
			text: ''
		};
		this.createRange();
		this.setMenuStatus();
	}
	/**
	 * 更新全屏状态
	 * @method setFullScreenState
	 */
	setFullScreenState() {
		this.setMenuStatus({
			fullscreen: document.fullscreenElement === this.container
		});
	}
	/**
	 * 渲染工具栏操作面板
	 * @method renderHeadingPicker
	 * @return {Object}   头部虚拟DOM
	 */
	renderHeadingPicker() {
		return this.heading.map(head => {
			return (
				<li
					className="f-z-li"
					key={head.tag}
					onMouseDown={() => {
						this.createRange();
					}}
					onClick={() => {
						this.setDropMenuStatus({
							heading: false
						});
						this.handleToolClick('heading', head.tag);
					}}
				>
					{head.node}
				</li>
			);
		});
	}
	/**
	 * 渲染字体颜色选择面板
	 * @method renderFontColorPicker
	 * @return {Object}   字体面板DOM
	 */
	renderFontColorPicker() {
		return this.fontColors.map(color => {
			return (
				<span
					className="r-t-color-options"
					key={color}
					tabIndex="0"
					style={{
						backgroundColor: color
					}}
					onMouseDown={() => {
						this.createRange();
					}}
					onClick={() => {
						this.setDropMenuStatus({
							'font-colors': false
						});
						this.handleToolClick('font-colors', color);
					}}
				/>
			);
		});
	}
	/**
	 * 渲染字体大小选择面板
	 * @method renderFontSizePicker
	 * @return {Object}   字体大小DOM
	 */
	renderFontSizePicker() {
		return Object.keys(this.fontSize)
			.sort()
			.reverse()
			.map(size => {
				return (
					<li
						className="f-z-li"
						key={size}
						style={{
							fontSize: this.fontSize[size]
						}}
						onMouseDown={() => {
							this.createRange();
						}}
						onClick={() => {
							this.setDropMenuStatus({
								'font-size': false
							});
							this.handleToolClick('font-size', size);
						}}
					>
						{this.fontSize[size]}
					</li>
				);
			});
	}
	cmd(...args) {
		document.execCommand(...args);
	}
	setHeader(tag) {
		const selectText = this.selection.text;
		// 选中多行
		if (/\n/.test(selectText)) {
			const html = selectText.split(/\n/).map(item => {
				if (item.length) {
					return `<${tag}>${item}</${tag}>`;
				}
				return '';
			});
			this.cmd('insertHTML', false, html.join(''));
		} else {
			this.cmd('formatBlock', false, tag);
		}
	}
	/**
	 * 工具栏点击事件
	 * @method handleToolClick
	 * @param  {String}    操作类型，bold、indent等
	 */
	handleToolClick(type, params) {
		const { menuStatus, dropMenuStatus } = this.state;

		switch (type) {
			case 'heading':
				this.createRange();
				this.setHeader(params);
				break;
			case 'font-colors':
				this.createRange();
				this.cmd('foreColor', false, params);
				break;
			case 'font-size':
				this.createRange();
				this.cmd('fontSize', false, params);
				break;
			case 'link':
				this.createRange();
				this.cmd('createLink', false, params);
				break;
			case 'image':
				this.createRange();
				this.cmd('insertImage', false, params);
				break;
			case 'fullscreen':
				menuStatus['fullscreen']
					? this.exitFullscreen()
					: this.fullScreen();
				break;
		}
	}
	/**
	 * 设置单个菜单状态
	 * @method setOneMenuStatus
	 * @param  {[type]}         status [description]
	 */
	setOneMenuStatus(status) {
		this.setState(
			{
				menuStatus: {
					...this.state.menuStatus,
					...status
				}
			},
			() => {
				// 更新同类菜单状态，如左/中/右对齐
				this.setMenuStatus();
			}
		);
	}
	/**
	 * 根据当前样式设置所有菜单状态
	 * @method setMenuStatus
	 */
	setMenuStatus(status) {
		let styles = [];
		const menuStatus = {
			fullscreen: this.state.menuStatus.fullscreen
		};
		const currentStatus = {};
		// reset
		for (let menu in this.state.menuStatus) {
			if (menu !== 'fullscreen') menuStatus[menu] = false;
		}
		this.getSelection();
		styles = this.getCurrentStyle();
		styles.forEach(item => {
			currentStatus[item] = true;
		});
		this.setState({
			menuStatus: {
				...menuStatus,
				...currentStatus,
				...status
			}
		});
	}
	/**
	 * 设置有下拉操作面板的菜单状态，如字体颜色操作
	 * @method setMenuStatus
	 */
	setDropMenuStatus(status) {
		this.setState({
			dropMenuStatus: {
				...this.state.dropMenuStatus,
				...status
			}
		});
	}

	fullScreen() {
		if (this.container.requestFullScreen) {
			this.container.requestFullScreen();
		} else if (this.container.webkitRequestFullScreen) {
			this.container.webkitRequestFullScreen();
		}
	}
	exitFullscreen() {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	}
	/**
	 * 创建选区，选中文字
	 * @method createRange
	 */
	createRange() {
		let {
			anchorNode,
			anchorOffset,
			focusNode,
			focusOffset,
			text
		} = this.selection;
		let range = document.createRange();
		let selection = document.getSelection();

		if (!anchorNode) return;
		try {
			// 判断 anchorNode是否在focusNode之前，true: 从左往右选中，false: 从右往左选中
			let leftToRight = this.compareNodesOrder(anchorNode, focusNode);
			if (
				leftToRight ||
				(anchorNode === focusNode && anchorOffset < focusOffset)
			) {
				range.setStart(anchorNode, anchorOffset);
				range.setEnd(focusNode, focusOffset);
				this.selection = {
					anchorNode,
					anchorOffset,
					focusNode,
					focusOffset,
					text
				};
			} else {
				range.setStart(focusNode, focusOffset);
				range.setEnd(anchorNode, anchorOffset);
				this.selection = {
					anchorNode: focusNode,
					anchorOffset: focusOffset,
					focusNode: anchorNode,
					focusOffset: anchorOffset,
					text
				};
			}

			selection.removeAllRanges();
			selection.addRange(range);
		} catch (err) {
			// 不报错
		}
	}
	/**
	 * 判断两个节点先后顺序，true:nodeA在nodeB前，false:nodeA不在nodeB前
	 * @method compareNodesOrder
	 */
	compareNodesOrder(nodeA, nodeB) {
		const getRootParent = node => {
			if (node.parentNode === this.content) return node;
			return getRootParent(node.parentNode);
		};
		const xBeforey = (nodeX, nodeY) => {
			if (nodeX.nextElementSibling === null) return false;
			if (nodeX.nextElementSibling === nodeY) return true;
			return xBeforey(nodeX.nextElementSibling);
		};
		const parentA = getRootParent(nodeA);
		const parentB = getRootParent(nodeB);

		return xBeforey(parentA, parentB);
	}
	hasFocus() {
		return document.activeElement === this.content;
	}

	getSelection() {
		const selection = document.getSelection();
		const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
		if (!this.hasFocus()) return false;
		this.selection = {
			anchorNode,
			anchorOffset,
			focusNode,
			focusOffset,
			text: selection.toString()
		};
	}
	getCurrentStyle() {
		if (!this.hasFocus()) return [];
		let node = this.selection.anchorNode;
		const result = [];
		const status = {
			'font-weight': 'bold',
			'text-decoration-line': 'underline',
			'font-style': 'italic',
			color: 'font-colors',
			'font-size': 'font-size',
			'text-align': '',
			'text-indent': 'indent'
		};
		// 文本节点
		if (node.nodeType === 3) {
			node = node.parentNode;
		}
		const computed = (node, names) => {
			if (node === this.content) return names;
			const styles = node.getAttribute('style');

			if (!styles) return names;
			styles.split(';').forEach(item => {
				if (!item.length) return false;
				let styleName = item.split(': ')[0].trim();
				let styleValue = item.split(': ')[1].trim();

				if (styleName in status) {
					// 设置heading再设置bold会取消heading的bold
					if (styleName === 'font-weight') {
						styleValue === 'bold' && names.push('bold');
					} else if (styleName === 'text-align') {
						names.push(
							{
								left: 'align-left',
								center: 'align-center',
								right: 'align-right'
							}[styleValue]
						);
					} else {
						names.push(status[styleName]);
					}
				}
			});
			return computed(node.parentNode, names);
		};
		return computed(node, result);
	}
	/**
	 * 插入链接、图片
	 * @method insert
	 * @param  {String} type       插入类型：link/image
	 * @param  {String} url        url地址
	 * @param  {String} resetState 插入之后清空输入框数据
	 */
	insert(type, url, resetState) {
		this.handleToolClick(type, url);
		this.setDropMenuStatus({
			[type]: false
		});
		this.setState({
			[resetState]: ''
		});
	}
	save() {
		return this.content.innerHTML;
	}
	render() {
		const { menuStatus, dropMenuStatus, linkUrl, imageUrl } = this.state;
		const fullscreenClass = classnames('r-t-button icon-fullscreen', {
			'r-t-button-active': menuStatus.fullscreen
		});
		const { width, height } = this.props;

		return (
			<div className="r-t-container" style={{ width, height }}>
				<div className="r-t-toolbar">
					<DropMenu
						classNames="r-t-heading"
						type="heading"
						icon="icon-header"
						active={dropMenuStatus['heading']}
						setMenuStatus={this.setDropMenuStatus}
					>
						<div className="r-t-submenu r-t-heading-panel">
							<ul className="r-t-heading-list">
								{this.renderHeadingPicker()}
							</ul>
						</div>
					</DropMenu>
					<Menu
						setMenuStatus={this.setOneMenuStatus}
						type="bold"
						icon="icon-bold"
						active={menuStatus.bold}
					/>
					<Menu
						setMenuStatus={this.setOneMenuStatus}
						type="underline"
						icon="icon-underline"
						active={menuStatus.underline}
					/>
					<Menu
						setMenuStatus={this.setOneMenuStatus}
						type="italic"
						icon="icon-italic"
						active={menuStatus.italic}
					/>
					<DropMenu
						classNames="r-t-font-color"
						type="font-colors"
						icon="icon-font-colors"
						active={dropMenuStatus['font-colors']}
						setMenuStatus={this.setDropMenuStatus}
					>
						<div className="r-t-submenu r-t-color-panel">
							{this.renderFontColorPicker()}
						</div>
					</DropMenu>
					<DropMenu
						classNames="r-t-font-size"
						type="font-size"
						icon="icon-font-size"
						active={dropMenuStatus['font-size']}
						setMenuStatus={this.setDropMenuStatus}
					>
						<div className="r-t-submenu r-t-font-size-panel">
							<ul className="f-z-ul">
								{this.renderFontSizePicker()}
							</ul>
						</div>
					</DropMenu>
					<Menu
						setMenuStatus={this.setOneMenuStatus}
						type="indent"
						icon="icon-indent"
						active={menuStatus.indent}
					/>
					<Menu
						setMenuStatus={this.setOneMenuStatus}
						type="align-left"
						icon="icon-align-left"
						active={menuStatus['align-left']}
					/>
					<Menu
						setMenuStatus={this.setOneMenuStatus}
						type="align-center"
						icon="icon-align-center"
						active={menuStatus['align-center']}
					/>
					<Menu
						setMenuStatus={this.setOneMenuStatus}
						type="align-right"
						icon="icon-align-right"
						active={menuStatus['align-right']}
					/>
					<DropMenu
						classNames="r-t-link"
						type="link"
						icon="icon-link"
						active={dropMenuStatus['link']}
						setMenuStatus={this.setDropMenuStatus}
					>
						<div className="r-t-submenu r-t-link-panel">
							<div className="r-t-link-item">
								<span className="r-t-link-desc">链接地址：</span>
								<input
									type="text"
									tabIndex="0"
									value={linkUrl}
									onChange={e => {
										this.setState({
											linkUrl: e.target.value
										});
									}}
									className="r-t-link-input"
								/>
							</div>
							<div className="r-t-link-item">
								<button
									onClick={() => {
										this.insert('link', linkUrl, 'linkUrl');
									}}
									className="r-t-link-save"
									tabIndex="0"
								>
									保存
								</button>
								<button
									onClick={() => {
										this.setDropMenuStatus({
											link: false
										});
									}}
									className="r-t-link-cancel"
									tabIndex="0"
								>
									取消
								</button>
							</div>
						</div>
					</DropMenu>
					<DropMenu
						classNames="r-t-link"
						type="image"
						icon="icon-image"
						active={dropMenuStatus['image']}
						setMenuStatus={this.setDropMenuStatus}
					>
						<div className="r-t-submenu r-t-link-panel">
							<div className="r-t-link-item">
								<span className="r-t-link-desc">图片地址：</span>
								<input
									type="text"
									tabIndex="0"
									value={imageUrl}
									onChange={e => {
										this.setState({
											imageUrl: e.target.value
										});
									}}
									className="r-t-link-input"
								/>
							</div>
							<div className="r-t-link-item">
								<button
									onClick={() => {
										this.insert(
											'image',
											imageUrl,
											'imageUrl'
										);
									}}
									className="r-t-link-save"
									tabIndex="0"
								>
									保存
								</button>
								<button
									onClick={() => {
										this.setDropMenuStatus({
											image: false
										});
									}}
									className="r-t-link-cancel"
									tabIndex="0"
								>
									取消
								</button>
							</div>
						</div>
					</DropMenu>
					<Menu
						setMenuStatus={this.setOneMenuStatus}
						type="undo"
						icon="icon-undo"
					/>
					<Menu
						setMenuStatus={this.setOneMenuStatus}
						type="redo"
						icon="icon-redo"
					/>
					<div className="r-t-menu r-t-fullscreen">
						<button
							id="de-fullscreen"
							className={fullscreenClass}
							onClick={() => {
								this.handleToolClick('fullscreen');
							}}
						/>
					</div>
				</div>
				<div
					className="r-t-content"
					autoFocus="autofocus"
					contentEditable="true"
					spellCheck="false"
					suppressContentEditableWarning="true"
					onMouseUp={() => {
						setTimeout(() => {
							this.setMenuStatus();
							this.createRange();
						}, 10);
					}}
					onKeyUp={() => {
						this.setMenuStatus();
						this.createRange();
					}}
				>
					{this.props.children}
				</div>
			</div>
		);
	}
}

Index.propTypes = {
	width: PropTypes.string,
	height: PropTypes.string
};

export default Index;