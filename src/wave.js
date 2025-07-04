import React, { Component } from "react";

let reportedError;
const boatHeight = 274;
const boatWidth = 400;
const middlePoint = 2;

class WaveBase extends Component {
	_container = React.createRef();
	_lastUpdate = 0;
	_elapsed = 0;
	_step = 0;
	_frameId;
	points = [];

	constructor(props) {
		super(props);
		this.state = { path: "" };
		this._update = this._update.bind(this);
	}

	_calculateWavePoints() {
		const points = [];
		for (let i = 0; i <= Math.max(this.props.points, 1); i++) {
			const scale = 100;
			const x = (i / this.props.points) * this._width();
			const seed =
				(this._step + (i + (i % this.props.points))) * this.props.speed * scale;
			const height = Math.sin(seed / scale) * this.props.amplitude;
			const y = Math.sin(seed / scale) * height + this.props.height;
			points.push({ x, y });
		}
		console.log(points[3]);
		this.points = points;
		return points;
	}

	_buildPath(points) {
		let svg = `M ${points[0].x} ${points[0].y}`;
		const initial = {
			x: (points[1].x - points[0].x) / 2,
			y: points[1].y - points[0].y + points[0].y + (points[1].y - points[0].y),
		};
		const cubic = (a, b) => ` C ${a.x} ${a.y} ${a.x} ${a.y} ${b.x} ${b.y}`;
		svg += cubic(initial, points[1]);
		let point = initial;
		for (let i = 1; i < points.length - 1; i++) {
			point = {
				x: points[i].x - point.x + points[i].x,
				y: points[i].y - point.y + points[i].y,
			};
			svg += cubic(point, points[i + 1]);
		}
		svg += ` L ${this._width()} ${this._height()}`;
		svg += ` L 0 ${this._height()} Z`;
		return svg;
	}

	_width = () => this._container.current.offsetWidth;
	_height = () => this._container.current.offsetHeight;

	_redraw() {
		this.setState({
			path: this._buildPath(this._calculateWavePoints()),
		});
	}

	_draw() {
		if (!this.props.paused) {
			const now = new Date();
			this._elapsed += now - this._lastUpdate;
			this._lastUpdate = now;
		}
		const scale = 1000;
		this._step = (this._elapsed * Math.PI) / scale;
		this._redraw();
	}

	_update() {
		this._draw();
		if (this._frameId) {
			this._resume();
		}
	}

	_resume() {
		this._frameId = window.requestAnimationFrame(this._update);
		this._lastUpdate = new Date();
	}

	componentDidMount() {
		if (!this._frameId) {
			this._resume();
		}
	}

	componentWillUnmount() {
		window.cancelAnimationFrame(this._frameId);
		this._frameId = 0;
	}

	gradient(p1, p2) {
		return (p2.y - p1.y) / (p2.x - p1.x);
	}

	render() {
		const {
			style,
			className,
			fill,
			paused,
			children,
			id,
			svgId,
			svgPathId,
			d,
			ref,
			height,
			amplitude,
			speed,
			points,
			...rest
		} = this.props;

		return (
			<div
				style={{ width: "100%", display: "inline-block", ...style }}
				className={className}
				id={id}
				ref={this._container}
			>
				{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
				<svg
					title="Wave"
					width="100%"
					height="100%"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					id={svgId}
				>
					{children}
					{this.points[3] && (
						<image
							href="/boat.png"
							x={this.points[middlePoint].x - boatWidth / 2}
							y={
								this.points[middlePoint].y -
								-200 -
								boatHeight -
								this.gradient(
									this.points[middlePoint - 1],
									this.points[middlePoint + 1],
								) *
									200
							}
							width={boatWidth}
							height={boatHeight}
							transform={`rotate(${this.gradient(this.points[middlePoint - 1], this.points[middlePoint + 1]) * 110}, ${this.points[middlePoint].x - boatWidth / 2}, ${this.points[middlePoint].y - boatHeight})`}
						/>
					)}
					<path
						{...Object.assign(
							{},
							{ d: this.state.path, fill, id: svgPathId },
							rest,
						)}
					/>
				</svg>
			</div>
		);
	}
}

const Wave = ({ options, ...rest }) => (
	<WaveBase
		{...Object.assign(
			{
				fill: "#fff",
				paused: false,
				height: 20,
				amplitude: 20,
				speed: 0.15,
				points: 3,
			},
			options,
			rest,
		)}
	/>
);

export default Wave;
